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

  // /rest/restore/{object} (length 2) and /rest/restore/{object}/{id} (length 3)
  // must be accepted. The previous check used (length > 3 && restore) which is
  // never true when length is already > 2, so restore-one was always rejected.
  const isRestorePath = queryAction[0] === 'restore';
  const maxPathSegments = isRestorePath ? 3 : 2;

  if (queryAction.length > maxPathSegments) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /rest/companies/id or /rest/companies or /rest/batch/companies or /rest/restore/companies/id`,
    );
  }

  if (queryAction.length === 0) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /rest/companies/id or /rest/companies or /rest/batch/companies or /rest/restore/companies/id`,
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

  if (isRestorePath) {
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
