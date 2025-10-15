import { BadRequestException } from '@nestjs/common';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseAggregateFieldsRestRequest = (
  request: AuthenticatedRequest,
): CommonSelectedFields => {
  const aggregateFieldsQuery = request.query.aggregate;

  if (typeof aggregateFieldsQuery !== 'string') {
    throw new BadRequestException(
      `Invalid aggregate query parameter - should be a valid array of string - ex: ["countNotEmptyId", "countEmptyField_1"]`,
    );
  }

  try {
    const aggregateFields = JSON.parse(aggregateFieldsQuery);

    return aggregateFields.reduce(
      (acc: CommonSelectedFields, field: string) => {
        acc[field] = true;

        return acc;
      },
      {},
    );
  } catch {
    throw new BadRequestException(
      `Invalid aggregate query parameter - should be a valid array of string - ex: ["countNotEmptyId", "countEmptyField_1"]`,
    );
  }
};
