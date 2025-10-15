import { BadRequestException } from '@nestjs/common';

import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseGroupByRestRequest = (
  request: AuthenticatedRequest,
): ObjectRecordGroupBy => {
  const groupByQuery = request.query.group_by;

  if (typeof groupByQuery !== 'string') {
    throw new BadRequestException(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"field_2": true}, {"field_3": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  }

  try {
    return JSON.parse(groupByQuery);
  } catch {
    throw new BadRequestException(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"field_2": true}, {"field_3": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  }
};
