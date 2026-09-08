import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { z } from 'zod';
import { type Credentials } from './secure-store';

export const validateServerUrl = (value: string): string => {
  const url = new URL(value);
  const loopback = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new Error(
      'Enter your Twenty workspace URL, using HTTPS or localhost.',
    );
  }
  return url.origin;
};

const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().positive(),
});

export class TwentyRequestError extends Error {
  constructor(
    readonly status: number,
    url: string,
  ) {
    super(
      `Twenty returned ${status} for ${new URL(url).pathname}. ${status === 401 ? 'Reconnect your workspace.' : 'Please try again.'}`,
    );
    this.name = 'TwentyRequestError';
  }
}

export class DesktopRecorderUnavailableError extends Error {
  constructor(readonly serverUrl: string) {
    super(
      'Desktop Recorder is unavailable in this workspace. Install it to continue.',
    );
    this.name = 'DesktopRecorderUnavailableError';
  }
}

export const requestJson = async (
  url: string,
  init: RequestInit = {},
): Promise<unknown> => {
  const response = await fetch(url, {
    ...init,
    redirect: 'error',
    signal: init.signal
      ? AbortSignal.any([init.signal, AbortSignal.timeout(30_000)])
      : AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const error = z
      .object({ error: z.literal('application_not_installed') })
      .safeParse(await response.json().catch(() => null));
    if (error.success)
      throw new DesktopRecorderUnavailableError(new URL(url).origin);
    throw new TwentyRequestError(response.status, url);
  }
  return response.json();
};

export const refreshCredentials = async (
  credentials: Credentials,
): Promise<Credentials> => {
  const result = tokenSchema.parse(
    await requestJson(`${credentials.serverUrl}/oauth/token`, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: credentials.clientId,
      }),
    }),
  );
  return {
    ...credentials,
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: Date.now() + result.expires_in * 1000,
  };
};

export const getDesktopSetupUrl = async (
  serverUrlInput: string,
): Promise<string> => {
  const serverUrl = validateServerUrl(serverUrlInput);
  const discovery = z
    .object({ issuer: z.string(), authorization_endpoint: z.string().url() })
    .parse(
      await requestJson(`${serverUrl}/.well-known/oauth-authorization-server`),
    );
  if (discovery.issuer !== serverUrl)
    throw new Error('Twenty returned a different OAuth issuer.');
  const frontendUrl = validateServerUrl(
    new URL(discovery.authorization_endpoint).origin,
  );
  return `${frontendUrl}/settings/desktop-app`;
};

export const getDesktopInstallationUrl = async (
  serverUrl: string,
): Promise<string> => {
  const setupUrl = await getDesktopSetupUrl(serverUrl);
  return new URL(
    '/settings/applications/available/8bdaaa9f-dc53-4247-a89b-aa386c9b3244',
    setupUrl,
  ).href;
};

export const connectOAuth = async (
  serverUrlInput: string,
  openBrowser: (url: string) => Promise<void>,
  signal?: AbortSignal,
): Promise<Credentials> => {
  const serverUrl = validateServerUrl(serverUrlInput);
  const discovery = z
    .object({
      issuer: z.string().url(),
      authorization_endpoint: z.string().url(),
      desktop_client_id: z.string().min(1).optional(),
      authorization_response_iss_parameter_supported: z.boolean().optional(),
    })
    .parse(
      await requestJson(`${serverUrl}/.well-known/oauth-authorization-server`, {
        signal,
      }),
    );
  if (discovery.issuer !== serverUrl)
    throw new Error('Twenty returned a different OAuth issuer.');
  if (!discovery.desktop_client_id)
    throw new DesktopRecorderUnavailableError(serverUrl);
  const clientId = discovery.desktop_client_id;
  const authorizationEndpoint = new URL(discovery.authorization_endpoint);
  validateServerUrl(authorizationEndpoint.origin);
  const verifier = randomBytes(32).toString('base64url');
  const state = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  let resolveCode: (value: string) => void;
  let rejectCode: (error: Error) => void;
  const codePromise = new Promise<string>((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });
  // Handle cancellation even if the browser takes longer than the callback deadline.
  void codePromise.catch(() => undefined);
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (request.method !== 'GET' || url.pathname !== '/callback') {
      response.writeHead(404).end();
      return;
    }
    const receivedState = Buffer.from(url.searchParams.get('state') ?? '');
    const expectedState = Buffer.from(state);
    if (
      receivedState.length !== expectedState.length ||
      !timingSafeEqual(receivedState, expectedState)
    ) {
      response.writeHead(400).end('Invalid authorization state.');
      return;
    }
    if (
      (discovery.authorization_response_iss_parameter_supported ||
        url.searchParams.has('iss')) &&
      url.searchParams.get('iss') !== discovery.issuer
    ) {
      response.writeHead(400).end('Invalid authorization issuer.');
      rejectCode(new Error('Twenty returned a different OAuth issuer.'));
      return;
    }
    const code = url.searchParams.get('code');
    response
      .writeHead(200, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      })
      .end(
        code
          ? 'Returning to Twenty… You can close this tab.'
          : 'Connection canceled. Return to Twenty.',
      );
    if (code) resolveCode(code);
    else rejectCode(new Error('Twenty connection was canceled.'));
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, 'localhost', resolve);
  });
  const timer = setTimeout(
    () => rejectCode(new Error('Connection timed out. Try connecting again.')),
    180_000,
  );
  const abort = () => rejectCode(new Error('Connection canceled.'));
  signal?.addEventListener('abort', abort, { once: true });
  try {
    signal?.throwIfAborted();
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Could not start the OAuth callback.');
    const redirectUri = `http://localhost:${address.port}/callback`;
    const authorizationUrl = authorizationEndpoint;
    const authorizationParameters = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'api profile',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    authorizationParameters.forEach((value, name) =>
      authorizationUrl.searchParams.set(name, value),
    );
    signal?.throwIfAborted();
    await openBrowser(authorizationUrl.href);
    const code = await codePromise;
    const result = tokenSchema.parse(
      await requestJson(`${serverUrl}/oauth/token`, {
        method: 'POST',
        signal,
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: verifier,
        }),
      }),
    );
    return {
      serverUrl,
      clientId,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expiresAt: Date.now() + result.expires_in * 1000,
    };
  } finally {
    signal?.removeEventListener('abort', abort);
    clearTimeout(timer);
    server.closeAllConnections();
    server.close();
  }
};
