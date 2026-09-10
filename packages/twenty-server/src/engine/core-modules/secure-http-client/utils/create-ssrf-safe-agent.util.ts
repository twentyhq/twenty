import * as http from 'http';
import * as https from 'https';
import { type Socket } from 'net';
import { type Duplex } from 'stream';

import { getIsBlockedIp } from 'src/engine/core-modules/secure-http-client/utils/is-allowed-internal-host.util';

type IsBlockedIp = ReturnType<typeof getIsBlockedIp>;

// Checks whether a hostname is a blocked IP literal.
// Returns false for domain names — those are validated after DNS
// resolution in the socket 'lookup' event handler.
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

// Validates a resolved IP and destroys the socket if it's blocked.
// Fails closed: if the IP cannot be parsed, the socket is destroyed.
const attachLookupValidation = (
  duplex: Duplex,
  isBlockedIp: IsBlockedIp,
): Socket => {
  // createConnection returns a net.Socket at runtime; the Duplex
  // return type in @types/node is overly broad.
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

// Agents that block connections to private IPs. Validation happens at
// the connection level (createConnection + socket 'lookup' event),
// which means every connection is checked — including those created
// by automatic redirect following.
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
