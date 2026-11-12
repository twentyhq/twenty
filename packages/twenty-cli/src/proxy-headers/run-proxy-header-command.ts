import { isNumber } from '@sniptt/guards';
import execa from 'execa';

import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';
import { PROXY_HEADER_COMMAND } from '@/proxy-headers/constants/proxy-header-command.constant';
import { parseProxyHeaderLines } from '@/proxy-headers/parse-proxy-header-lines';

const SOURCE_NAME = 'The proxy header command';

const describeFailure = ({
  timedOut,
  exitCode,
}: {
  timedOut: boolean;
  exitCode: number | undefined;
}) => {
  if (timedOut) {
    return `${SOURCE_NAME} did not finish within ${PROXY_HEADER_COMMAND.TIMEOUT_MILLISECONDS / 1000} seconds.`;
  }

  if (isNumber(exitCode)) {
    return `${SOURCE_NAME} failed with exit code ${exitCode}.`;
  }

  return `${SOURCE_NAME} failed.`;
};

export const runProxyHeaderCommand = async ({
  command,
  signal,
}: {
  command: string;
  signal: AbortSignal;
}) => {
  signal.throwIfAborted();

  // A shell, like git credential helpers, lets users compose $(...) commands.
  const subprocess = execa(command, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    reject: false,
    timeout: PROXY_HEADER_COMMAND.TIMEOUT_MILLISECONDS,
    maxBuffer: PROXY_HEADER_COMMAND.MAX_OUTPUT_BYTES,
  });
  const cancel = () =>
    subprocess.kill('SIGTERM', { forceKillAfterTimeout: 1000 });

  signal.addEventListener('abort', cancel, { once: true });

  if (signal.aborted) {
    cancel();
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
          timedOut: result.timedOut,
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

    return parseProxyHeaderLines({
      lines: (result.stdout ?? '').split(/\r?\n/),
      sourceName: SOURCE_NAME,
    });
  } finally {
    signal.removeEventListener('abort', cancel);
  }
};
