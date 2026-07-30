#!/bin/sh
set -eu

LOG_FILE="${TWENTY_UPGRADE_LOG_FILE:-/tmp/twenty-upgrade.log}"
PID_FILE="${TWENTY_UPGRADE_PID_FILE:-/tmp/twenty-upgrade.pid}"
LOG_MAX_BYTES="${TWENTY_UPGRADE_LOG_MAX_BYTES:-52428800}"
CAP_FILE="$LOG_FILE.cap"
CAP_MARKER="--- log capped to $LOG_MAX_BYTES bytes, earlier output dropped, this line is truncated: "
TAIL_LINES=20
export LOG_FILE PID_FILE LOG_MAX_BYTES CAP_FILE CAP_MARKER

upgrade_pid() { [ -s "$PID_FILE" ] && cat "$PID_FILE" || return 1; }
stream()      { exec tail -f "$LOG_FILE"; }

is_our_upgrade() {
  [ -r "/proc/$1/cmdline" ] || return 0
  tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null | grep -q 'dist/command/command'
}

is_running() {
  pid=$(upgrade_pid) && kill -0 "$pid" 2>/dev/null && is_our_upgrade "$pid"
}

detach_hint() {
  echo "Ctrl+C detaches the stream only. Use 'yarn upgrade:background:stop' to stop the run."
}

show_tail() {
  [ -f "$LOG_FILE" ] || return 0
  echo "Tail of $LOG_FILE:" >&2
  tail -n "$TAIL_LINES" "$LOG_FILE"
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
  case "$LOG_MAX_BYTES" in
    '' | *[!0-9]*) echo "Failed to start: TWENTY_UPGRADE_LOG_MAX_BYTES must be a whole number of bytes (0 disables the cap)" >&2; exit 1 ;;
  esac

  command -v setsid > /dev/null || {
    echo "Failed to start: setsid not found, cannot detach the run from this terminal" >&2
    echo "Use 'yarn command:prod upgrade' to run it in the foreground instead." >&2
    exit 1
  }

  if is_running; then
    echo "Failed to start: already running (pid $(upgrade_pid))" >&2; exit 1
  fi
  : > "$LOG_FILE"; rm -f "$PID_FILE" "$CAP_FILE"

  # Not exec: the wrapper has to outlive node to record EXIT=, and stop has to
  # signal node alone, never the process group this would otherwise share.
  # It also caps the log itself, between liveness checks, rather than from a
  # second process: nothing can be left behind, and a cap cannot race the EXIT=
  # line it now always precedes. The cap truncates in place, never rotates,
  # since node holds an O_APPEND fd on this inode and would keep writing to
  # whatever we moved aside; O_APPEND resumes at the new EOF, so no sparse hole.
  # An empty cmdline is what ends the loop: it covers a SIGKILLed run left as a
  # zombie, which kill -0 still finds since PID 1 in the pod never reaps.
  setsid sh -c '
    node dist/command/command upgrade "$@" &
    run_pid=$!
    echo $run_pid > "$PID_FILE"
    while [ "$LOG_MAX_BYTES" -gt 0 ] && { tr "\0" " " < /proc/$run_pid/cmdline | grep -q dist/command/command; } 2>/dev/null; do
      sleep 1
      size=$(stat -c %s "$LOG_FILE" 2>/dev/null || wc -c < "$LOG_FILE" 2>/dev/null)
      [ $((size)) -gt "$LOG_MAX_BYTES" ] || continue
      tail -c $((LOG_MAX_BYTES / 2)) "$LOG_FILE" > "$CAP_FILE" || continue
      { printf "%s" "$CAP_MARKER"; cat "$CAP_FILE"; } > "$LOG_FILE"
      rm -f "$CAP_FILE"
    done
    wait $run_pid
    echo "EXIT=$?"
  ' upgrade-background "$@" < /dev/null >> "$LOG_FILE" 2>&1 &

  i=0
  while [ ! -s "$PID_FILE" ] && [ "$i" -lt 10 ]; do i=$((i + 1)); sleep 1; done
  is_running || {
    echo "Failed to start: see $LOG_FILE" >&2
    tail -n "$TAIL_LINES" "$LOG_FILE" >&2
    exit 1
  }

  echo "Running (pid $(upgrade_pid)), logging to $LOG_FILE"
  detach_hint
  stream
}

logs() {
  if is_running; then
    echo "Running (pid $(upgrade_pid)), following $LOG_FILE" >&2
    detach_hint >&2
    stream
  fi
  [ -f "$LOG_FILE" ] || { echo "Not running, no log at $LOG_FILE" >&2; exit 1; }
  echo "Not running, last run $(last_run)" >&2
  show_tail
}

stop() {
  is_running || { echo "Not running, nothing to stop" >&2; rm -f "$PID_FILE"; exit 1; }
  pid=$(upgrade_pid)

  case "${1:-}" in
    "")
      kill -TERM "$pid"
      echo "SIGTERM sent to $pid, it finishes the step in progress then stops (exit 143)" >&2
      sleep 1
      show_tail
      echo "Follow with 'yarn upgrade:background:logs'. Still stuck: 'stop --now'. Last resort: 'stop --force'." >&2
      ;;
    --now)
      kill -TERM "$pid"; sleep 2; kill -TERM "$pid" 2>/dev/null || true
      echo "Second SIGTERM sent to $pid, immediate exit with the step in progress left unfinished" >&2
      sleep 1
      show_tail
      ;;
    --force)
      kill -KILL "$pid"
      echo "SIGKILL sent to $pid, no graceful boundary so a multi-transaction command may leave partial work" >&2
      show_tail
      ;;
    *) echo "usage: stop [--now|--force]" >&2; exit 1 ;;
  esac
}

case "${1:-}" in
  start) shift; start "$@" ;;
  logs)  logs ;;
  stop)  shift; stop "$@" ;;
  *) echo "usage: $0 {start [args]|logs|stop [--now|--force]}" >&2; exit 1 ;;
esac
