import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordCreationFormContext } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback, useContext } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useRecordCreationForm = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const recordCreationFormContext = useContext(RecordCreationFormContext);

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const shouldOpenRecordCreationForm =
    isDefined(recordCreationFormContext) &&
    isNonEmptyArray(recordFormFieldMetadataItems);

  const requestRecordCreation = useCallback(
    ({
      initialDraftRecord,
      createRecord,
    }: {
      initialDraftRecord?: Partial<ObjectRecord>;
      createRecord: (
        draftRecord: Partial<ObjectRecord>,
      ) => Promise<ObjectRecord>;
    }) =>
      isDefined(recordCreationFormContext)
        ? recordCreationFormContext.requestRecordCreation({
            objectMetadataItem,
            initialDraftRecord,
            createRecord,
          })
        : createRecord(initialDraftRecord ?? {}),
    [recordCreationFormContext, objectMetadataItem],
  );

  return { shouldOpenRecordCreationForm, requestRecordCreation };
};
