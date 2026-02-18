import * as http from 'http';
import * as https from 'https';
import { type Socket } from 'net';
import { type Duplex } from 'stream';

import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

// Checks whether a hostname is a private IP literal.
// Returns false for domain names — those are validated after DNS
// resolution in the socket 'lookup' event handler.
const isHostnamePrivateIp = (hostname: string): boolean => {
  try {
    return isPrivateIp(hostname);
  } catch {
    return false;
  }
};

const validateHost = (host?: string) => {
  if (host && isHostnamePrivateIp(host)) {
    throw new Error(`Request to internal IP address ${host} is not allowed.`);
  }
};

// Validates a resolved IP and destroys the socket if it's private.
// Fails closed: if the IP cannot be parsed, the socket is destroyed.
const attachLookupValidation = (duplex: Duplex): Socket => {
  // createConnection returns a net.Socket at runtime; the Duplex
  // return type in @types/node is overly broad.
  const socket = duplex as Socket;

  socket.on('lookup', (error: Error | null, address: string) => {
    if (error) {
      return;
    }

    try {
      if (isPrivateIp(address)) {
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
  createConnection(
    options: http.ClientRequestArgs,
    callback?: (err: Error, stream: Duplex) => void,
  ): Duplex {
    validateHost(options.host ?? undefined);

    return attachLookupValidation(super.createConnection(options, callback));
  }
}

class SsrfSafeHttpsAgent extends https.Agent {
  createConnection(
    options: http.ClientRequestArgs,
    callback?: (err: Error, stream: Duplex) => void,
  ): Duplex {
    validateHost(options.host ?? undefined);

    return attachLookupValidation(super.createConnection(options, callback));
  }
}

export const createSsrfSafeAgent = (protocol: 'http' | 'https'): http.Agent => {
  return protocol === 'https'
    ? new SsrfSafeHttpsAgent()
    : new SsrfSafeHttpAgent();
};
