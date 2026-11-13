import { isNumber } from '@sniptt/guards';
import execa from 'execa';
import { onExit } from 'signal-exit';
import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';
import { PROXY_HEADER_COMMAND } from '@/proxy-headers/constants/proxy-header-command.constant';
import { parseProxyHeaderLinesOrThrow } from '@/proxy-headers/parse-proxy-header-lines-or-throw';

const SOURCE_NAME = 'The proxy header command';

const IS_WINDOWS = process.platform === 'win32';

const signalProcessTree = ({
  subprocess,
  signalName,
}: {
  subprocess: execa.ExecaChildProcess;
  signalName: NodeJS.Signals;
}) => {
  const processId = subprocess.pid;

  if (IS_WINDOWS || !isNumber(processId)) {
    subprocess.kill(signalName);

    return;
  }

  try {
    process.kill(-processId, signalName);
  } catch {
    // The group already exited.
  }
};

const isProcessTreeRunning = (subprocess: execa.ExecaChildProcess) => {
  const processId = subprocess.pid;

  if (IS_WINDOWS || !isNumber(processId)) {
    return subprocess.exitCode === null && subprocess.signalCode === null;
  }

  try {
    process.kill(-processId, 0);

    return true;
  } catch {
    return false;
  }
};

const STOP_GRACE_PERIOD_MILLISECONDS = 1000;

const describeFailure = ({
  isTimedOut,
  exitCode,
}: {
  isTimedOut: boolean;
  exitCode: number | undefined;
}) => {
  if (isTimedOut) {
    return `${SOURCE_NAME} did not finish within ${PROXY_HEADER_COMMAND.TIMEOUT_MILLISECONDS / 1000} seconds.`;
  }

  if (isNumber(exitCode)) {
    return `${SOURCE_NAME} failed with exit code ${exitCode}.`;
  }

  return `${SOURCE_NAME} failed.`;
};

export const runProxyHeaderCommandOrThrow = async ({
  command,
  signal,
}: {
  command: string;
  signal: AbortSignal;
}) => {
  signal.throwIfAborted();

  // A shell allows $(...); its own process group lets a stop reach what it starts.
  const subprocess = execa(command, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    reject: false,
    detached: !IS_WINDOWS,
    maxBuffer: PROXY_HEADER_COMMAND.MAX_OUTPUT_BYTES,
  });
  // execa skips its own exit cleanup for detached processes.
  const removeExitHook = onExit(() =>
    signalProcessTree({ subprocess, signalName: 'SIGKILL' }),
  );
  let forceStopTimer: NodeJS.Timeout | undefined;
  let isTimedOut = false;
  let isSucceeded = false;
  const stop = () => {
    if (isDefined(forceStopTimer)) {
      return;
    }

    signalProcessTree({ subprocess, signalName: 'SIGTERM' });
    // Kept referenced so the CLI cannot exit before stopping what ignored SIGTERM.
    forceStopTimer = setTimeout(() => {
      signalProcessTree({ subprocess, signalName: 'SIGKILL' });
      // A process that left the group may still hold the pipes open.
      subprocess.stdout?.destroy();
      subprocess.stderr?.destroy();
      removeExitHook();
    }, STOP_GRACE_PERIOD_MILLISECONDS);
  };
  const timeoutTimer = setTimeout(() => {
    isTimedOut = true;
    stop();
  }, PROXY_HEADER_COMMAND.TIMEOUT_MILLISECONDS);

  signal.addEventListener('abort', stop, { once: true });

  if (signal.aborted) {
    stop();
  }

  try {
    const result = await subprocess;

    if (signal.aborted) {
      throw createCancelledError();
    }

    if (result.failed) {
      // stdout is never echoed: it holds the proxy credentials.
      throw new CliError({
        code: 'PROXY_HEADERS_FAILED',
        message: describeFailure({
          isTimedOut,
          exitCode: result.exitCode,
        }),
        hint: 'Run the command yourself to check it prints "Name: value" lines, for example after signing in to the proxy again.',
        details: {
          exitCode: result.exitCode ?? null,
          stderr: (result.stderr ?? '')
            .trim()
            .slice(-PROXY_HEADER_COMMAND.STDERR_EXCERPT_LENGTH),
        },
      });
    }

    const headers = parseProxyHeaderLinesOrThrow({
      lines: (result.stdout ?? '').split(/\r?\n/),
      sourceName: SOURCE_NAME,
    });

    isSucceeded = true;

    return headers;
  } finally {
    clearTimeout(timeoutTimer);
    signal.removeEventListener('abort', stop);

    // A failed run can leave processes behind, for example past the output limit.
    if (!isSucceeded) {
      stop();
    }

    if (!isDefined(forceStopTimer) || !isProcessTreeRunning(subprocess)) {
      clearTimeout(forceStopTimer);
      removeExitHook();
    }
  }
};
