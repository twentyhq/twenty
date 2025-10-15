import { BadRequestException } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type OrderByWithGroupBy } from 'twenty-shared/types';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseOrderByWithGroupByRestRequest = (
  request: AuthenticatedRequest,
): OrderByWithGroupBy | undefined => {
  const orderByWithGroupByQuery = request.query.order_by;

  if (typeof orderByWithGroupByQuery !== 'string') return undefined;

  try {
    return JSON.parse(orderByWithGroupByQuery);
  } catch {
    throw new BadRequestException(
      msg`Invalid order_by query parameter - should be a valid array of objects - ex: [{"field_2": "AscNullsFirst"}, {"field_3": {"subField": "DescNullsLast"}}, {"aggregate": {"aggregateField": "DescNullsLast"}}, {dateField: {"orderBy": "AscNullsFirst", "granularity": "DAY"}}]`,
    );
  }
};
