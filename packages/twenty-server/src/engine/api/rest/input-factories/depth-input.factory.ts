import { BadRequestException, Injectable } from '@nestjs/common';

import { type Request } from 'express';

export const MAX_DEPTH = 2;

export type Depth = 0 | 1 | 2;

const ALLOWED_DEPTH_VALUES: Depth[] = [0, 1];

@Injectable()
export class DepthInputFactory {
  create(request: Request): Depth {
    if (!request.query.depth) {
      return 0;
    }

    const depth = +request.query.depth as Depth;

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
