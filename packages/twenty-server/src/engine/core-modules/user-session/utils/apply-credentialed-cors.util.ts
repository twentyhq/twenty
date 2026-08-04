import { type INestApplication } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import { type CredentialedOriginService } from 'src/engine/core-modules/user-session/services/credentialed-origin.service';

// Shared between the production bootstrap and the integration test harness so
// the CORS behavior under test is the deployed one.
export const applyCredentialedCors = (
  app: INestApplication,
  credentialedOriginService: CredentialedOriginService,
): void => {
  // The cors package only emits Vary: Origin when it reflects one, so wildcard
  // and reflected responses would share a cache entry and a credentialed
  // request could be served the wildcard, which browsers reject.
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.vary('Origin');
    next();
  });

  app.enableCors({
    // Resolved per request rather than once at boot: the origins derive from
    // config the admin panel can change and from the workspace registry, and a
    // snapshot would drift from the CSRF guard, which resolves them per
    // request and would then disagree with CORS about the same origin.
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean | string) => void,
    ) => {
      if (!origin) {
        return callback(null, '*');
      }

      credentialedOriginService
        .isOriginAllowed(origin)
        .then((allowed) => callback(null, allowed ? true : '*'))
        // Fail closed to the public wildcard: no credentialed reflection on a
        // lookup failure, and no 500 on every request during a DB hiccup.
        .catch(() => callback(null, '*'));
    },
    credentials: true,
    // Expose WWW-Authenticate so browser-based MCP clients can read the
    // resource_metadata pointer on 401. Required by MCP authorization spec.
    exposedHeaders: ['WWW-Authenticate'],
  });
};
