import express from 'express';
import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

import { isFrontendDocumentRequest } from 'src/engine/core-modules/frontend/utils/is-frontend-document-request.util';

describe('isFrontendDocumentRequest', () => {
  const app = express();

  app.use((request, response) => {
    response.status(isFrontendDocumentRequest(request) ? 200 : 404).end();
  });

  it.each([undefined, '*/*', 'text/*', 'text/html', 'text/html;q=0.5'])(
    'accepts document routes with Accept: %s',
    async (accept) => {
      for (const pathname of [
        '/',
        '/index.html',
        '/objects/people',
        '/invite/apple.dev-token',
      ]) {
        const response = request(app).get(pathname);

        if (isDefined(accept)) {
          response.set('Accept', accept);
        }

        await response.expect(200);
      }
    },
  );

  it.each([
    'application/json',
    'image/png',
    'text/html;q=0',
    'text/html;q=0,*/*;q=1',
  ])('does not serve HTML when Accept excludes it: %s', async (accept) => {
    await request(app).get('/').set('Accept', accept).expect(404);
  });

  it.each(['document', 'iframe', 'frame'])(
    'accepts a %s navigation with a wildcard',
    async (destination) => {
      await request(app)
        .get('/invite/apple.dev-token')
        .set('Accept', '*/*')
        .set('Sec-Fetch-Dest', destination)
        .expect(200);
    },
  );

  it.each(['script', 'style', 'image', 'font', 'empty'])(
    'does not turn a missing %s resource into HTML',
    async (destination) => {
      await request(app)
        .get('/new-asset-directory/missing')
        .set('Accept', '*/*')
        .set('Sec-Fetch-Dest', destination)
        .expect(404);
    },
  );

  it.each([
    '/graphql',
    '/graphql/missing',
    '/rest/missing',
    '/auth/missing',
    '/.well-known/missing',
  ])('keeps API path %s out of the document fallback', async (pathname) => {
    await request(app).get(pathname).set('Accept', '*/*').expect(404);
  });

  it('accepts HEAD without an Accept header', async () => {
    await request(app).head('/').expect(200);
  });

  it('does not serve HTML for POST', async () => {
    await request(app).post('/').set('Accept', '*/*').expect(404);
  });
});
