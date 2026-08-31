#!/bin/sh
set -eu

LOG_FILE="${TWENTY_COMMAND_LOG_FILE:-/tmp/twenty-command.log}"
PID_FILE="${TWENTY_COMMAND_PID_FILE:-/tmp/twenty-command.pid}"
TAIL_LINES=20
export LOG_FILE PID_FILE

command_pid() { [ -s "$PID_FILE" ] && cat "$PID_FILE" || return 1; }
stream()      { exec tail -f "$LOG_FILE"; }

is_our_command() {
  [ -r "/proc/$1/cmdline" ] || return 0
  tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null | grep -q 'dist/command/command'
}

is_running() {
  pid=$(command_pid) && kill -0 "$pid" 2>/dev/null && is_our_command "$pid"
}

detach_hint() {
  echo "Ctrl+C detaches the stream only. Use 'yarn command:prod:background:stop' to stop the run."
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
    130) echo "stopped gracefully on SIGINT" ;;
    143) echo "stopped gracefully on SIGTERM" ;;
    137) echo "killed (SIGKILL) — partial work possible" ;;
    "")  echo "left no exit code — killed, or never started" ;;
    *)   echo "failed (exit $code)" ;;
  esac
}

start() {
  [ $# -ge 1 ] || {
    echo "usage: yarn command:prod:background <command> [args]" >&2; exit 1
  }

  command -v setsid > /dev/null || {
    echo "Failed to start: setsid not found, cannot detach the run from this terminal" >&2
    echo "Use 'yarn command:prod $1' to run it in the foreground instead." >&2
    exit 1
  }

  if is_running; then
    echo "Failed to start: already running (pid $(command_pid)), one background command at a time" >&2
    exit 1
  fi
  : > "$LOG_FILE"; rm -f "$PID_FILE"

  # Not exec: the wrapper has to outlive node to record EXIT=, and stop has to
  # signal node alone, never the process group this would otherwise share.
  setsid sh -c '
    node dist/command/command "$@" &
    echo $! > "$PID_FILE"
    wait $!
    echo "EXIT=$?"
  ' command-background "$@" < /dev/null >> "$LOG_FILE" 2>&1 &

  i=0
  while [ ! -s "$PID_FILE" ] && [ "$i" -lt 10 ]; do i=$((i + 1)); sleep 1; done
  is_running || {
    echo "Failed to start: see $LOG_FILE" >&2
    tail -n "$TAIL_LINES" "$LOG_FILE" >&2
    exit 1
  }

  echo "Running (pid $(command_pid)), logging to $LOG_FILE"
  detach_hint
  stream
}

logs() {
  if is_running; then
    echo "Running (pid $(command_pid)), following $LOG_FILE" >&2
    detach_hint >&2
    stream
  fi
  [ -f "$LOG_FILE" ] || { echo "Not running, no log at $LOG_FILE" >&2; exit 1; }
  echo "Not running, last run $(last_run)" >&2
  show_tail
}

stop() {
  is_running || { echo "Not running, nothing to stop" >&2; rm -f "$PID_FILE"; exit 1; }
  pid=$(command_pid)

  case "${1:-}" in
    "")
      kill -TERM "$pid"
      echo "SIGTERM sent to $pid, a command that handles it stops at its next boundary (exit 143)" >&2
      sleep 1
      show_tail
      echo "Follow with 'yarn command:prod:background:logs'. Still stuck: 'stop --now'. Last resort: 'stop --force'." >&2
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
  *) echo "usage: $0 {start <command> [args]|logs|stop [--now|--force]}" >&2; exit 1 ;;
esac
