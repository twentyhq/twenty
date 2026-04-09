import { isDefined } from 'class-validator';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { type FieldGroupByDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/types/field-group-by-definition.type';

export const isGroupByDateFieldDefinition = (
  fieldGroupByDefinition: FieldGroupByDefinition,
): fieldGroupByDefinition is {
  granularity: ObjectRecordGroupByDateGranularity;
} => {
  if (
    typeof fieldGroupByDefinition !== 'object' ||
    !isDefined(fieldGroupByDefinition)
  ) {
    return false;
  }
  if (!('granularity' in fieldGroupByDefinition)) {
    return false;
  }

  const granularity = fieldGroupByDefinition.granularity;

  return (
    isDefined(granularity) &&
    typeof granularity === 'string' &&
    Object.values(ObjectRecordGroupByDateGranularity).includes(
      granularity as ObjectRecordGroupByDateGranularity,
    )
  );
};
