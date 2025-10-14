import { isDefined } from 'twenty-shared/utils';
import { type FindOperator, In } from 'typeorm';

import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { getValueFromPath } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-value-from-path.util';

export const buildWhereConditions = (
  records: Partial<ObjectRecord>[],
  conflictingFields: {
    baseField: string;
    fullPath: string;
    column: string;
  }[],
): Record<string, FindOperator<string>>[] => {
  const whereConditions: Record<string, FindOperator<string>>[] = [];

  for (const field of conflictingFields) {
    const fieldValues = records
      .map((record) => getValueFromPath(record, field.fullPath))
      .filter(isDefined);

    if (fieldValues.length > 0) {
      whereConditions.push({ [field.column]: In(fieldValues) });
    }
  }

  return whereConditions;
};
