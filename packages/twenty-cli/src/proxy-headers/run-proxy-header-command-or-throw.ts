import { isNumber } from '@sniptt/guards';
import execa from 'execa';

import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';
import { PROXY_HEADER_COMMAND } from '@/proxy-headers/constants/proxy-header-command.constant';
import { parseProxyHeaderLinesOrThrow } from '@/proxy-headers/parse-proxy-header-lines-or-throw';

const SOURCE_NAME = 'The proxy header command';

const IS_WINDOWS = process.platform === 'win32';

const signalProcessGroup = ({
  processId,
  signalName,
}: {
  processId: number;
  signalName: NodeJS.Signals;
}) => {
  try {
    process.kill(-processId, signalName);
  } catch {
    // The group already exited.
  }
};

const stopProcessTree = (subprocess: execa.ExecaChildProcess) => {
  const processId = subprocess.pid;

  if (IS_WINDOWS || !isNumber(processId)) {
    subprocess.kill('SIGTERM', { forceKillAfterTimeout: 1000 });

    return;
  }

  signalProcessGroup({ processId, signalName: 'SIGTERM' });
  setTimeout(
    () => signalProcessGroup({ processId, signalName: 'SIGKILL' }),
    1000,
  ).unref();
};

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

  // A shell, like git credential helpers, lets users compose $(...) commands;
  // its own process group lets a stop reach processes those commands start.
  const subprocess = execa(command, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    reject: false,
    detached: !IS_WINDOWS,
    maxBuffer: PROXY_HEADER_COMMAND.MAX_OUTPUT_BYTES,
  });
  let isTimedOut = false;
  const stop = () => stopProcessTree(subprocess);
  const timer = setTimeout(() => {
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

    return parseProxyHeaderLinesOrThrow({
      lines: (result.stdout ?? '').split(/\r?\n/),
      sourceName: SOURCE_NAME,
    });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
  }
};
