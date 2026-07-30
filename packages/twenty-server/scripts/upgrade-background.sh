#!/bin/sh
# Detached `upgrade`, cooperating with CommandShutdownService.
set -eu

LOG_FILE="${TWENTY_UPGRADE_LOG_FILE:-/tmp/twenty-upgrade.log}"
PID_FILE="${TWENTY_UPGRADE_PID_FILE:-/tmp/twenty-upgrade.pid}"
export LOG_FILE PID_FILE

upgrade_pid() { [ -s "$PID_FILE" ] && cat "$PID_FILE" || return 1; }
stream()      { exec tail -f "$LOG_FILE"; }

# A recorded pid outlives the run that wrote it, so a recycled pid would other-
# wise be reported as running and, worse, signalled by stop. Matches node once
# started and the claiming wrapper before that. Where /proc is unavailable
# (macOS) the check cannot run and the pid is taken at face value.
is_our_upgrade() {
  [ -r "/proc/$1/cmdline" ] || return 0
  tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null |
    grep -qE 'dist/command/command|upgrade-background\.sh'
}

is_running() {
  pid=$(upgrade_pid) && kill -0 "$pid" 2>/dev/null && is_our_upgrade "$pid"
}

# O_EXCL create, the atomic half of the singleton check: two concurrent starts
# both see no run in flight, but only one can create the pid file. It holds the
# claiming shell's pid until node's replaces it, never a blank the other starts
# would read as a leftover and delete.
claim() { (set -C; echo $$ > "$PID_FILE") 2>/dev/null; }

# Shared so start and logs cannot drift apart.
detach_hint() {
  echo "Ctrl+C detaches the stream only. Use 'yarn upgrade:background:stop' to stop the run."
}

last_run() {
  code=$(grep '^EXIT=' "$LOG_FILE" 2>/dev/null | tail -n 1 | cut -d= -f2)
  case "$code" in
    0)   echo "completed" ;;
    130) echo "stopped gracefully on SIGINT — rerun to resume" ;;
    143) echo "stopped gracefully on SIGTERM — rerun to resume" ;;
    137) echo "killed (SIGKILL) — partial work possible, rerun to resume" ;;
    "")  echo "left no exit code — killed, or never started" ;;
    *)   echo "failed (exit $code)" ;;
  esac
}

start() {
  command -v setsid > /dev/null || {
    echo "Failed to start: setsid not found, cannot detach the run from this terminal" >&2
    echo "Use 'yarn command:prod upgrade' to run it in the foreground instead." >&2
    exit 1
  }

  if ! claim; then
    if is_running; then
      echo "Failed to start: already running (pid $(upgrade_pid))" >&2; exit 1
    fi
    # Pid file left by a run that is no longer alive.
    rm -f "$PID_FILE"
    claim || { echo "Failed to start: another start claimed the run, retry" >&2; exit 1; }
  fi
  : > "$LOG_FILE"

  # setsid: own session, no controlling terminal -> survives disconnect.
  # The wrapper outlives node on purpose, so it can record the exit code.
  setsid sh -c '
    node dist/command/command upgrade "$@" &
    echo $! > "$PID_FILE"
    wait $!
    echo "EXIT=$?"
  ' upgrade-background "$@" < /dev/null >> "$LOG_FILE" 2>&1 &

  # Wait for node's pid to replace the claim, not merely for a non-empty file.
  i=0
  while [ "$(cat "$PID_FILE" 2>/dev/null)" = "$$" ] && [ "$i" -lt 10 ]; do
    i=$((i + 1)); sleep 1
  done
  is_running || { echo "Failed to start: see $LOG_FILE" >&2; tail -n 20 "$LOG_FILE" >&2; exit 1; }

  echo "Running (pid $(upgrade_pid)), logging to $LOG_FILE"
  detach_hint
  stream
}

# Reports what it found before streaming: a silent log is otherwise ambiguous
# between a slow workspace segment and a run that died without writing EXIT=.
logs() {
  if is_running; then
    echo "Running (pid $(upgrade_pid)), following $LOG_FILE" >&2
    detach_hint >&2
    stream
  fi
  [ -f "$LOG_FILE" ] || { echo "Not running, no log at $LOG_FILE" >&2; exit 1; }
  echo "Not running, last run $(last_run). Tail of $LOG_FILE:" >&2
  exec tail -n 20 "$LOG_FILE"
}

status() {
  is_running && { echo "Running (pid $(upgrade_pid))"; exit 0; }
  echo "Not running, last run $(last_run)"
  exit 1
}

stop() {
  is_running || { echo "Not running, nothing to stop" >&2; rm -f "$PID_FILE"; exit 1; }
  pid=$(upgrade_pid)

  case "${1:-}" in
    "")
      kill -TERM "$pid"
      echo "SIGTERM sent to $pid, it finishes the step in progress then stops (exit 143)"
      echo "Follow with 'yarn upgrade:background:logs'. Still stuck: 'stop --now'. Last resort: 'stop --force'."
      ;;
    --now)
      kill -TERM "$pid"; sleep 2; kill -TERM "$pid" 2>/dev/null || true
      echo "Second SIGTERM sent to $pid, immediate exit with the step in progress left unfinished"
      ;;
    --force)
      kill -KILL "$pid"
      echo "SIGKILL sent to $pid, no graceful boundary so a multi-transaction command may leave partial work" >&2
      ;;
    *) echo "usage: stop [--now|--force]" >&2; exit 1 ;;
  esac
}

case "${1:-}" in
  start)  shift; start "$@" ;;
  logs)   logs ;;
  status) status ;;
  stop)   shift; stop "$@" ;;
  *) echo "usage: $0 {start [args]|logs|status|stop [--now|--force]}" >&2; exit 1 ;;
esac
