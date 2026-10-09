import { createServer } from 'node:http';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OAUTH_TIMING } from '@/oauth/constants/oauth-timing.constant';
import { CliError } from '@/output/cli-error';
import { getListeningPort } from '@/utils/get-listening-port';

const CALLBACK_PATH = '/callback';

const renderCallbackPage = (message: string) =>
  `<!doctype html><meta charset="utf-8"><title>Twenty CLI</title><body style="margin:0;display:grid;place-items:center;min-height:100vh;font-family:system-ui,sans-serif"><p>${message}</p></body>`;

const createSignInError = (message: string) =>
  new CliError({
    code: 'OAUTH_FAILED',
    message,
    hint: 'Run twenty auth login again.',
  });

const readAuthorizationCode = ({
  url,
  state,
  issuer,
  isIssuerInResponse,
}: {
  url: URL;
  state: string;
  issuer: string;
  isIssuerInResponse: boolean;
}) => {
  const returnedIssuer = url.searchParams.get('iss');

  if (isIssuerInResponse && !isDefined(returnedIssuer)) {
    throw createSignInError(
      'The sign-in response does not say which server sent it.',
    );
  }

  if (isDefined(returnedIssuer) && returnedIssuer !== issuer) {
    throw createSignInError(
      `The sign-in response came from ${returnedIssuer} instead of ${issuer}.`,
    );
  }

  if (url.searchParams.get('state') !== state) {
    throw createSignInError(
      'The sign-in response does not match this login attempt.',
    );
  }

  const error = url.searchParams.get('error');

  if (isNonEmptyString(error)) {
    throw createSignInError(
      error === 'access_denied'
        ? 'Sign-in was declined in the browser.'
        : `Sign-in failed: ${url.searchParams.get('error_description') ?? error}`,
    );
  }

  const code = url.searchParams.get('code');

  if (!isNonEmptyString(code)) {
    throw createSignInError('The sign-in response has no authorization code.');
  }

  return code;
};

export const startCallbackServer = async ({
  state,
  issuer,
  isIssuerInResponse,
  signal,
}: {
  state: string;
  issuer: string;
  isIssuerInResponse: boolean;
  signal: AbortSignal;
}) => {
  const {
    promise: codePromise,
    resolve,
    reject,
  } = Promise.withResolvers<string>();

  codePromise.catch(() => undefined);

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (url.pathname !== CALLBACK_PATH) {
      response.writeHead(404, { Connection: 'close' }).end();

      return;
    }

    try {
      const code = readAuthorizationCode({
        url,
        state,
        issuer,
        isIssuerInResponse,
      });

      response
        .writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          Connection: 'close',
        })
        .end(
          renderCallbackPage(
            'Signed in. You can close this tab and go back to the terminal.',
          ),
        );
      resolve(code);
    } catch (error) {
      response
        .writeHead(400, {
          'Content-Type': 'text/html; charset=utf-8',
          Connection: 'close',
        })
        .end(
          renderCallbackPage(
            'Sign-in did not complete. Go back to the terminal for details.',
          ),
        );
      reject(error);
    }
  });

  await new Promise<void>((listening, failed) => {
    server.once('error', failed);
    server.listen(0, '127.0.0.1', () => listening());
  });

  const port = getListeningPort(server);
  const timeout = setTimeout(
    () =>
      reject(
        new CliError({
          code: 'TIMEOUT',
          message: `Sign-in was not completed within ${OAUTH_TIMING.SIGN_IN_TIMEOUT_MILLISECONDS / 60_000} minutes.`,
          hint: 'Run twenty auth login again.',
        }),
      ),
    OAUTH_TIMING.SIGN_IN_TIMEOUT_MILLISECONDS,
  );
  const rejectOnAbort = () => reject(signal.reason);
  const close = () => {
    clearTimeout(timeout);
    signal.removeEventListener('abort', rejectOnAbort);
    server.closeAllConnections();
    server.close();
  };

  if (signal.aborted) {
    close();
    signal.throwIfAborted();
  }

  signal.addEventListener('abort', rejectOnAbort, { once: true });

  return {
    redirectUri: `http://127.0.0.1:${port}${CALLBACK_PATH}`,
    waitForCode: () => codePromise,
    close,
  };
};
