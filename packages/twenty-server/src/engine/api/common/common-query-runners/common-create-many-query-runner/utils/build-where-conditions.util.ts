import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOperator, In } from 'typeorm';

import { type ConflictingFieldGroup } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { getValueFromPath } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/get-value-from-path.util';

export const buildWhereConditions = (
  records: Partial<ObjectRecord>[],
  conflictingFieldGroups: ConflictingFieldGroup[],
): Record<string, FindOperator<string>>[] => {
  const whereConditions: Record<string, FindOperator<string>>[] = [];

  for (const conflictingProperty of conflictingFieldGroups.flatMap(
    (group) => group.conflictingProperties,
  )) {
    const fieldValues = records
      .map((record) => getValueFromPath(record, conflictingProperty.fullPath))
      .filter(isDefined);

    if (fieldValues.length > 0) {
      whereConditions.push({
        [conflictingProperty.column]: In(fieldValues),
      });
    }
  }

  return whereConditions;
};
