import { BadRequestException } from '@nestjs/common';

import { type Request } from 'express';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const parseCorePath = (
  request: Request,
): { object: string; id?: string } => {
  const queryAction = request.path
    .replace('/rest/', '')
    .replace('/rest', '')
    .split('/')
    .filter(Boolean);

  if (
    queryAction.length > 2 ||
    (queryAction.length > 3 && queryAction[0] === 'restore')
  ) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /rest/companies/id or /rest/companies or /rest/batch/companies`,
    );
  }

  if (queryAction.length === 0) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /rest/companies/id or /rest/companies or /rest/batch/companies`,
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

  if (queryAction[0] === 'restore') {
    const recordId = queryAction[2];

    if (isDefined(recordId) && !isValidUuid(recordId)) {
      throw new BadRequestException(`'${recordId}' is not a valid UUID`);
    }

    return {
      object: queryAction[1],
      id: recordId,
    };
  }

  const recordId = queryAction[1];

  if (!isValidUuid(recordId)) {
    throw new BadRequestException(`'${recordId}' is not a valid UUID`);
  }

  return { object: queryAction[0], id: recordId };
};
