import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

const ALLOWED_DEPTH_VALUES = [0, 1, 2];

@Injectable()
export class DepthInputFactory {
  create(request: Request): number {
    if (!request.query.depth) {
      return 0;
    }

    const depth = +request.query.depth;

    if (isNaN(depth) || !ALLOWED_DEPTH_VALUES.includes(depth)) {
      throw new BadRequestException(
        `'depth=${
          request.query.depth
        }' parameter invalid. Allowed values are ${ALLOWED_DEPTH_VALUES.join(
          ', ',
        )}`,
      );
    }

    return depth;
  }
}
