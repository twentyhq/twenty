import { BadRequestException, Injectable } from '@nestjs/common';

import {
  QUERY_DEFAULT_LIMIT_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';

import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

@Injectable()
export class LimitInputFactory {
  create(
    request: RequestContext,
    defaultLimit = QUERY_DEFAULT_LIMIT_RECORDS,
  ): number {
    if (!request.query?.limit) {
      return defaultLimit;
    }
    const limit = +request.query.limit;

    if (isNaN(limit) || limit < 0) {
      throw new BadRequestException(
        `limit '${request.query.limit}' is invalid. Should be an integer`,
      );
    }

    return Math.min(limit, QUERY_MAX_RECORDS);
  }
}
