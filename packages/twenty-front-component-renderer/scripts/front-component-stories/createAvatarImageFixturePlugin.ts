import { type ServerResponse } from 'node:http';

import { isDefined } from 'twenty-shared/utils';
import { type Plugin } from 'vite';

import { AVATAR_IMAGE_FIXTURE } from '../../src/__stories__/twenty-ui-gallery/constants/AVATAR_IMAGE_FIXTURE';

const AVATAR_IMAGE_REQUEST_PATTERN =
  /^\/__twenty-ui-avatar-image__\/([a-z0-9-]+)\.svg(?:\/(status|release))?$/;
const REQUEST_TIMEOUT_IN_MS = 30000;

type ImageRequest = {
  responses: Set<ServerResponse>;
  released: boolean;
  timer: ReturnType<typeof setTimeout>;
};

const sendImage = (response: ServerResponse) => {
  response.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-store',
  });
  response.end(AVATAR_IMAGE_FIXTURE.pendingImage);
};

const releaseRequest = (request: ImageRequest | undefined) => {
  if (!isDefined(request)) {
    return;
  }

  request.released = true;
  for (const response of request.responses) {
    sendImage(response);
  }
  request.responses.clear();
};

export const createAvatarImageFixturePlugin = (): Plugin => ({
  name: 'twenty-avatar-image-fixture',
  configureServer(server) {
    const requests = new Map<string, ImageRequest>();

    const removeRequest = (requestId: string) => {
      const request = requests.get(requestId);

      if (!isDefined(request)) {
        return;
      }

      clearTimeout(request.timer);
      for (const response of request.responses) {
        response.writeHead(410);
        response.end();
      }
      requests.delete(requestId);
    };

    server.httpServer?.once('close', () => {
      for (const requestId of requests.keys()) {
        removeRequest(requestId);
      }
    });

    server.middlewares.use((request, response, next) => {
      const match = AVATAR_IMAGE_REQUEST_PATTERN.exec(request.url ?? '');

      if (!isDefined(match)) {
        next();
        return;
      }

      const [, requestId, action] = match;
      let imageRequest = requests.get(requestId);

      if (action === 'status') {
        response.setHeader('Content-Type', 'application/json');
        response.end(
          JSON.stringify({ pending: imageRequest?.responses.size ?? 0 }),
        );
        return;
      }

      if (action === 'release') {
        releaseRequest(imageRequest);
        response.writeHead(204);
        response.end();
        return;
      }

      if (!isDefined(imageRequest)) {
        imageRequest = {
          responses: new Set(),
          released: false,
          timer: setTimeout(
            () => removeRequest(requestId),
            REQUEST_TIMEOUT_IN_MS,
          ),
        };
        requests.set(requestId, imageRequest);
      }

      if (imageRequest.released) {
        sendImage(response);
        return;
      }

      const { responses } = imageRequest;

      responses.add(response);
      response.once('close', () => responses.delete(response));
    });
  },
});
