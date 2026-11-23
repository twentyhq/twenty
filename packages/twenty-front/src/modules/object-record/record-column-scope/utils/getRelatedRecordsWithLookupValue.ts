import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const getRelatedRecordsWithLookupValue = ({
  relatedRecords,
  lookupTargetFieldDefinition,
}: {
  relatedRecords: (ObjectRecord | null | undefined)[];
  lookupTargetFieldDefinition: Pick<
    FieldDefinition<FieldMetadata>,
    'type' | 'metadata'
  >;
}): ObjectRecord[] =>
  relatedRecords.filter(isDefined).filter(
    (relatedRecord) =>
      !isFieldValueEmpty({
        fieldDefinition: lookupTargetFieldDefinition,
        fieldValue:
          relatedRecord[lookupTargetFieldDefinition.metadata.fieldName],
      }),
  );
