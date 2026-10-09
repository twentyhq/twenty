import { type Dispatcher, type EnvHttpProxyAgent } from 'undici';

import { CliError } from '@/output/cli-error';

let proxyAgent: Promise<EnvHttpProxyAgent> | undefined;

const createProxyAgent = async () => {
  try {
    const { EnvHttpProxyAgent } = await import('undici');

    return new EnvHttpProxyAgent();
  } catch {
    throw new CliError({
      code: 'INVALID_CONFIG',
      message: 'Could not configure the network proxy.',
      hint: 'Check HTTP_PROXY, HTTPS_PROXY, http_proxy and https_proxy.',
    });
  }
};

export const fetchWithProxy = async (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
  timeoutMilliseconds?: number,
): Promise<Response> => {
  const httpProxy = process.env.http_proxy ?? process.env.HTTP_PROXY;
  const httpsProxy = process.env.https_proxy ?? process.env.HTTPS_PROXY;

  if (!httpProxy && !httpsProxy && timeoutMilliseconds === undefined) {
    return fetch(input, init);
  }

  let dispatcher: Dispatcher;
  if (httpProxy || httpsProxy) {
    proxyAgent ??= createProxyAgent();
    dispatcher = await proxyAgent;
  } else {
    dispatcher = (await import('undici')).getGlobalDispatcher();
  }

  const requestDispatcher: Pick<Dispatcher, 'dispatch'> =
    timeoutMilliseconds === undefined
      ? dispatcher
      : {
          dispatch: (options, handler) =>
            dispatcher.dispatch(
              {
                ...options,
                headersTimeout: timeoutMilliseconds,
                bodyTimeout: timeoutMilliseconds,
              },
              handler,
            ),
        };
  const options = { ...init, dispatcher: requestDispatcher };

  return fetch(input, options);
};
