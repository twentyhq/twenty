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

  // /{object}/{id}/restore is PATCH only: other methods' wildcard routes would read the id as a target (DELETE would destroy it)
  const isRestoreRequest =
    request.method === 'PATCH' &&
    queryAction[queryAction.length - 1] === 'restore';

  const maximumSegmentCount = isRestoreRequest ? 3 : 2;

  if (queryAction.length > maximumSegmentCount) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /${ApiPath.Rest}/companies/id or /${ApiPath.Rest}/companies or /${ApiPath.Rest}/batch/companies`,
    );
  }

  const [firstSegment, secondSegment] = queryAction;

  if (!isDefined(firstSegment)) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /${ApiPath.Rest}/companies/id or /${ApiPath.Rest}/companies or /${ApiPath.Rest}/batch/companies`,
    );
  }

  if (!isDefined(secondSegment)) {
    return { object: firstSegment };
  }

  if (firstSegment === 'batch') {
    return { object: secondSegment };
  }

  if (
    secondSegment === 'duplicates' ||
    secondSegment === 'groupBy' ||
    secondSegment === 'merge'
  ) {
    return { object: firstSegment };
  }

  if (isRestoreRequest) {
    const recordId = queryAction.length === 3 ? secondSegment : undefined;

    if (isDefined(recordId) && !isValidUuid(recordId)) {
      throw new BadRequestException(`'${recordId}' is not a valid UUID`);
    }

    return {
      object: firstSegment,
      id: recordId,
    };
  }

  if (!isValidUuid(secondSegment)) {
    throw new BadRequestException(`'${secondSegment}' is not a valid UUID`);
  }

  return { object: firstSegment, id: secondSegment };
};
