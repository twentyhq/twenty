import { isNull } from '@sniptt/guards';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const computeRecordGroupOptionsFilter = ({
  recordGroupFieldMetadata,
  recordGroupValues,
}: {
  recordGroupFieldMetadata: FieldMetadataItem | null | undefined;
  recordGroupValues: RecordGroupDefinition['value'][];
}): RecordGqlOperationFilter => {
  if (!isDefined(recordGroupFieldMetadata)) {
    return {};
  }

  const fieldName = recordGroupFieldMetadata.name;
  const hasNullValue = recordGroupValues.some(isNull);

  if (!hasNullValue) {
    return {
      [fieldName]: {
        in: recordGroupValues,
      },
    };
  }

  const nonNullValues = recordGroupValues.filter(
    (value): value is NonNullable<typeof value> => !isNull(value),
  );

  return {
    or: [
      { [fieldName]: { is: 'NULL' } },
      { [fieldName]: { in: nonNullValues } },
    ],
  };
};
