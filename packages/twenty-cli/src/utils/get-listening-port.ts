import { type Server } from 'node:net';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const getListeningPort = (server: Server) => {
  const address = server.address();

  if (!isDefined(address) || isString(address)) {
    throw new Error('The server is not listening on a TCP port.');
  }

  return address.port;
};
