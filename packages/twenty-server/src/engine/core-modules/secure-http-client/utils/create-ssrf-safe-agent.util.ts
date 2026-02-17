import * as http from 'http';
import * as https from 'https';
import { type Socket } from 'net';

import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

type CreateConnectionOptions = {
  host?: string;
  port?: number;
  localAddress?: string;
};

type CreateConnectionCallback = (
  error: Error | null,
  socket: Socket,
) => void;

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

// Validates a resolved IP and destroys the socket if it's private.
// Fails closed: if the IP cannot be parsed, the socket is destroyed.
const onSocketLookup = (
  socket: Socket,
  error: Error | null,
  address: string,
) => {
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
};

// Creates an http or https Agent that blocks connections to private IPs.
// Validation happens at the connection level (createConnection + socket
// 'lookup' event), which means every connection is checked — including
// those created by automatic redirect following.
export const createSsrfSafeAgent = (
  protocol: 'http' | 'https',
): http.Agent => {
  const agent =
    protocol === 'https' ? new https.Agent() : new http.Agent();

  const originalCreateConnection = agent.createConnection;

  (agent as any).createConnection = function (
    this: http.Agent,
    options: CreateConnectionOptions,
    oncreate: CreateConnectionCallback,
  ) {
    if (options.host && isHostnamePrivateIp(options.host)) {
      throw new Error(
        `Request to internal IP address ${options.host} is not allowed.`,
      );
    }

    const socket: Socket = originalCreateConnection.call(
      this,
      options,
      oncreate,
    );

    socket.on(
      'lookup',
      (error: Error | null, address: string) =>
        onSocketLookup(socket, error, address),
    );

    return socket;
  };

  return agent;
};
