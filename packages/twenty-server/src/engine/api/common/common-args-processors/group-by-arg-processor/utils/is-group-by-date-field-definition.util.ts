import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { type DateFieldGroupByDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/types/date-field-group-by-definition.type';

const GROUP_BY_DATE_GRANULARITIES = new Set<string>(
  Object.values(ObjectRecordGroupByDateGranularity),
);

export const isGroupByDateFieldDefinition = (
  fieldGroupByDefinition: unknown,
): fieldGroupByDefinition is DateFieldGroupByDefinition => {
  if (!isPlainObject(fieldGroupByDefinition)) {
    return false;
  }

  if (!('granularity' in fieldGroupByDefinition)) {
    return false;
  }

  const granularity = fieldGroupByDefinition.granularity;

  return (
    typeof granularity === 'string' &&
    GROUP_BY_DATE_GRANULARITIES.has(granularity)
  );
};
