import { BadRequestException } from '@nestjs/common';

import { type Request } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const parseCorePath = (
  request: Request,
): { object: string; id?: string } => {
  const queryAction = request.path
    .replace(new RegExp(`^/${ApiPath.Rest}`), '')
    .split('/')
    .filter(Boolean);

  // Restore is the only action on a single record, so /{object}/{id}/restore
  // is the one path with a third segment. It is mounted on PATCH alone;
  // allowing the segment on other methods would let a restore-shaped path
  // through their wildcard routes, where DELETE would read the id as a
  // destroy target.
  const isRestoreRequest =
    request.method === 'PATCH' &&
    queryAction[queryAction.length - 1] === 'restore';

  const maximumSegmentCount = isRestoreRequest ? 3 : 2;

  if (queryAction.length > maximumSegmentCount) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /${ApiPath.Rest}/companies/id or /${ApiPath.Rest}/companies or /${ApiPath.Rest}/batch/companies`,
    );
  }

  if (queryAction.length === 0) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /${ApiPath.Rest}/companies/id or /${ApiPath.Rest}/companies or /${ApiPath.Rest}/batch/companies`,
    );
  }

  if (queryAction.length === 1) {
    return { object: queryAction[0] };
  }

  if (queryAction[0] === 'batch') {
    return { object: queryAction[1] };
  }

  if (
    queryAction[1] === 'duplicates' ||
    queryAction[1] === 'groupBy' ||
    queryAction[1] === 'merge'
  ) {
    return { object: queryAction[0] };
  }

  if (isRestoreRequest) {
    const recordId = queryAction.length === 3 ? queryAction[1] : undefined;

    if (isDefined(recordId) && !isValidUuid(recordId)) {
      throw new BadRequestException(`'${recordId}' is not a valid UUID`);
    }

    return {
      object: queryAction[0],
      id: recordId,
    };
  }

  const recordId = queryAction[1];

  if (!isValidUuid(recordId)) {
    throw new BadRequestException(`'${recordId}' is not a valid UUID`);
  }

  return { object: queryAction[0], id: recordId };
};
