// Persistent Python "kernel" used by the LocalDriver to keep variables,
// imports and files alive across calls within the same session — matching the
// cross-call persistence the E2B driver provides.
//
// Protocol (newline-delimited JSON over dedicated file descriptors so user
// stdout/stderr never collide with control messages):
//   - reads requests from fd 3: { "code": "<base64-utf8>" }
//   - writes one response per request to fd 4:
//       { "stdout": "...", "stderr": "...", "exitCode": 0 | 1 }
// The namespace dict is reused for every request, so user-defined variables and
// imports survive between executions.
//
// A single mechanism guarantees the process is always destroyed: an idle
// watchdog thread that self-terminates after KERNEL_IDLE_TIMEOUT_MS of
// inactivity (0 disables it). As a free side effect of reading control input,
// the read loop also ends on EOF (fd 3) when the parent dies, so the process
// exits immediately on dev-server shutdown too.
export const LOCAL_DRIVER_PERSISTENT_KERNEL_SCRIPT = `import sys
import os
import io
import json
import base64
import contextlib
import traceback
import threading
import time

_last_activity = time.time()

def _idle_watchdog(idle_ms):
    while True:
        time.sleep(5)
        if (time.time() - _last_activity) * 1000 > idle_ms:
            os._exit(0)

def _main():
    global _last_activity

    idle_ms = int(os.environ.get('KERNEL_IDLE_TIMEOUT_MS', '0'))
    if idle_ms > 0:
        threading.Thread(target=_idle_watchdog, args=(idle_ms,), daemon=True).start()

    control_in = os.fdopen(3, 'r')
    control_out = os.fdopen(4, 'w')
    namespace = {'__name__': '__main__'}

    for line in control_in:
        _last_activity = time.time()
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
        except Exception:
            continue

        try:
            code = base64.b64decode(request.get('code', '')).decode('utf-8')
        except Exception:
            code = ''

        stdout_buffer = io.StringIO()
        stderr_buffer = io.StringIO()
        error = None

        with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
            try:
                exec(compile(code, '<cell>', 'exec'), namespace)
            except SystemExit:
                pass
            except BaseException:
                error = traceback.format_exc()

        stderr_value = stderr_buffer.getvalue()
        if error:
            stderr_value = stderr_value + error

        response = {
            'stdout': stdout_buffer.getvalue(),
            'stderr': stderr_value,
            'exitCode': 1 if error else 0,
        }
        control_out.write(json.dumps(response) + '\\n')
        control_out.flush()
        _last_activity = time.time()

_main()
`;
