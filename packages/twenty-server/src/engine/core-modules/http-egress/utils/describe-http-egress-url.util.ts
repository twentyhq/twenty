import { createHash } from 'crypto';

import { isString } from '@sniptt/guards';

type HttpEgressUrlDescription = {
  host?: string;
  port?: string;
  pathHash?: string;
};

const DEFAULT_PORT_BY_PROTOCOL: Record<string, string> = {
  'http:': '80',
  'https:': '443',
};

// Paths and query strings often carry secrets (incoming-webhook URLs, API keys), so only a hash of the path is logged.
export const describeHttpEgressUrl = (
  url: unknown,
): HttpEgressUrlDescription => {
  if (!isString(url)) {
    return {};
  }

  try {
    const parsedUrl = new URL(url);

    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port || DEFAULT_PORT_BY_PROTOCOL[parsedUrl.protocol],
      pathHash: createHash('sha256')
        .update(parsedUrl.pathname)
        .digest('hex')
        .slice(0, 16),
    };
  } catch {
    return {};
  }
};
