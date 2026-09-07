/* @license Enterprise */

import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { withApiRequestContext } from 'src/engine/core-modules/usage/storage/api-request-context.storage';
import { getApiTypeFromPath } from 'src/engine/core-modules/usage/utils/get-api-type-from-path.util';

@Injectable()
export class ApiRequestContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const [path] = req.originalUrl.split('?');
    const apiType = getApiTypeFromPath(path);

    if (!isDefined(apiType)) {
      next();

      return;
    }

    void withApiRequestContext(apiType, () => {
      next();
    });
  }
}
