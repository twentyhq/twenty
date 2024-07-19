import { BadRequestException } from '@nestjs/common';

import { Request } from 'express';

const ALLOWED_DEPTH_VALUES = [0, 1, 2];

export const computeDepth = (request: Request): number | undefined => {
  if (!request.query.depth) {
    return undefined;
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
};
