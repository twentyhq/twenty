import { isNull, isUndefined } from '@sniptt/guards';
import { type ServerResponse } from 'node:http';

import { type Plugin } from 'vite';

import { AVATAR_IMAGE_FIXTURE } from '../../src/__stories__/twenty-ui-gallery/constants/AvatarImageFixture';

const AVATAR_IMAGE_REQUEST_PATTERN =
  /^\/__twenty-ui-avatar-image__\/([a-z0-9-]+)\.svg(?:\/(status|release))?$/;
const REQUEST_TIMEOUT_IN_MS = 30000;

type ImageRequestState = 'pending' | 'released' | 'expired';

type ImageRequest = {
  state: ImageRequestState;
  responses: Set<ServerResponse>;
  timer: ReturnType<typeof setTimeout>;
};

const sendImage = (response: ServerResponse) => {
  response.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-store',
  });
  response.end(AVATAR_IMAGE_FIXTURE.pendingImage);
};

const sendGone = (response: ServerResponse) => {
  response.writeHead(410);
  response.end();
};

const flushResponses = (
  request: ImageRequest,
  respond: (response: ServerResponse) => void,
) => {
  for (const response of request.responses) {
    respond(response);
  }
  request.responses.clear();
};

export const createAvatarImageFixturePlugin = (): Plugin => ({
  name: 'twenty-avatar-image-fixture',
  configureServer(server) {
    const requests = new Map<string, ImageRequest>();

    const expireRequest = (request: ImageRequest) => {
      if (request.state !== 'pending') {
        return;
      }

      request.state = 'expired';
      flushResponses(request, sendGone);
    };

    const findOrCreateRequest = (requestId: string): ImageRequest => {
      const existingRequest = requests.get(requestId);

      if (!isUndefined(existingRequest)) {
        return existingRequest;
      }

      const request: ImageRequest = {
        state: 'pending',
        responses: new Set(),
        timer: setTimeout(() => expireRequest(request), REQUEST_TIMEOUT_IN_MS),
      };

      requests.set(requestId, request);

      return request;
    };

    server.httpServer?.once('close', () => {
      for (const request of requests.values()) {
        clearTimeout(request.timer);
        expireRequest(request);
      }
      requests.clear();
    });

    server.middlewares.use((request, response, next) => {
      const match = AVATAR_IMAGE_REQUEST_PATTERN.exec(request.url ?? '');

      if (isNull(match)) {
        next();
        return;
      }

      const [, requestId, action] = match;

      if (action === 'status') {
        response.setHeader('Content-Type', 'application/json');
        response.end(
          JSON.stringify({
            pending: requests.get(requestId)?.responses.size ?? 0,
          }),
        );
        return;
      }

      const imageRequest = findOrCreateRequest(requestId);

      if (action === 'release') {
        clearTimeout(imageRequest.timer);
        imageRequest.state = 'released';
        flushResponses(imageRequest, sendImage);
        response.writeHead(204);
        response.end();
        return;
      }

      if (imageRequest.state === 'released') {
        sendImage(response);
        return;
      }

      if (imageRequest.state === 'expired') {
        sendGone(response);
        return;
      }

      const { responses } = imageRequest;

      responses.add(response);
      response.once('close', () => responses.delete(response));
    });
  },
});
