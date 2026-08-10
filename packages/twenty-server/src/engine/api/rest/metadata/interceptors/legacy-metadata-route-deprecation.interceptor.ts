import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Request, type Response } from 'express';
import { type Observable } from 'rxjs';

// 2026-08-10T00:00:00Z as an RFC 9745 Structured Field Date.
const DEPRECATION_DATE = '@1786320000';

const LEGACY_ROUTE_SUCCESSORS = [
  {
    legacyPath: '/rest/apiKeys',
    successorPath: '/rest/metadata/apiKeys',
  },
  {
    legacyPath: '/rest/webhooks',
    successorPath: '/rest/metadata/webhooks',
  },
] as const;

@Injectable()
export class LegacyMetadataRouteDeprecationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestPath = request.originalUrl.split('?')[0];
    const successor = LEGACY_ROUTE_SUCCESSORS.find(
      ({ legacyPath }) =>
        requestPath === legacyPath || requestPath.startsWith(`${legacyPath}/`),
    );

    if (successor) {
      const successorPath = requestPath.replace(
        successor.legacyPath,
        successor.successorPath,
      );

      response.setHeader('Deprecation', DEPRECATION_DATE);
      response.setHeader('Link', `<${successorPath}>; rel="successor-version"`);
    }

    return next.handle();
  }
}
