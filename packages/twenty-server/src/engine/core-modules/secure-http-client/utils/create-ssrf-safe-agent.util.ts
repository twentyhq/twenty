import * as http from 'http';
import * as https from 'https';
import { type Socket } from 'net';
import { type Duplex } from 'stream';

import { getIsBlockedIp } from 'src/engine/core-modules/secure-http-client/utils/get-is-blocked-ip.util';

type IsBlockedIp = ReturnType<typeof getIsBlockedIp>;

// Domain names are validated after DNS resolution, in the socket 'lookup' handler.
const isHostnameBlockedIp = (
  hostname: string,
  isBlockedIp: IsBlockedIp,
): boolean => {
  try {
    return isBlockedIp(hostname);
  } catch {
    return false;
  }
};

const validateHost = (host: string | undefined, isBlockedIp: IsBlockedIp) => {
  if (host && isHostnameBlockedIp(host, isBlockedIp)) {
    throw new Error(`Request to internal IP address ${host} is not allowed.`);
  }
};

// Fails closed: an unparseable IP destroys the socket.
const attachLookupValidation = (
  duplex: Duplex,
  isBlockedIp: IsBlockedIp,
): Socket => {
  // @types/node types this as Duplex, but it is a net.Socket at runtime.
  const socket = duplex as Socket;

  socket.on('lookup', (error: Error | null, address: string) => {
    if (error) {
      return;
    }

    try {
      if (isBlockedIp(address)) {
        socket.destroy(
          new Error(
            `Request to internal IP address ${address} is not allowed.`,
          ),
        );
      }
    } catch {
      socket.destroy(
        new Error(
          `Request to unvalidatable IP address ${address} is not allowed.`,
        ),
      );
    }
  });

  return socket;
};

// Validated per connection, so connections opened by redirect following are checked too.
class SsrfSafeHttpAgent extends http.Agent {
  constructor(private readonly allowedInternalHosts: string[]) {
    super();
  }

  createConnection(
    options: http.ClientRequestArgs,
    callback?: (err: Error, stream: Duplex) => void,
  ): Duplex {
    const isBlockedIp = getIsBlockedIp(
      options.host ?? undefined,
      this.allowedInternalHosts,
    );

    validateHost(options.host ?? undefined, isBlockedIp);

    return attachLookupValidation(
      super.createConnection(options, callback),
      isBlockedIp,
    );
  }
}

class SsrfSafeHttpsAgent extends https.Agent {
  constructor(private readonly allowedInternalHosts: string[]) {
    super();
  }

  createConnection(
    options: http.ClientRequestArgs,
    callback?: (err: Error, stream: Duplex) => void,
  ): Duplex {
    const isBlockedIp = getIsBlockedIp(
      options.host ?? undefined,
      this.allowedInternalHosts,
    );

    validateHost(options.host ?? undefined, isBlockedIp);

    return attachLookupValidation(
      super.createConnection(options, callback),
      isBlockedIp,
    );
  }
}

export const createSsrfSafeAgent = (
  protocol: 'http' | 'https',
  allowedInternalHosts: string[] = [],
): http.Agent => {
  return protocol === 'https'
    ? new SsrfSafeHttpsAgent(allowedInternalHosts)
    : new SsrfSafeHttpAgent(allowedInternalHosts);
};
