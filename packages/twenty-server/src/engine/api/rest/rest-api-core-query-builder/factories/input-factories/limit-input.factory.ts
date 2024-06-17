import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

@Injectable()
export class LimitInputFactory {
  create(request: Request, defaultLimit = 60): number {
    if (!request.query.limit) {
      return defaultLimit;
    }
    const limit = +request.query.limit;

    if (isNaN(limit) || limit < 0) {
      throw new BadRequestException(
        `limit '${request.query.limit}' is invalid. Should be an integer`,
      );
    }

    return limit;
  }
}
