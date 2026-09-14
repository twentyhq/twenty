import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback } from 'react';

export const useRecordCreationForm = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { requestRecordCreation: requestRecordCreationInContext } =
    useRecordCreationFormContextOrThrow();

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
      requestRecordCreationInContext({
        objectMetadataItem,
        initialDraftRecord,
        createRecord,
      }),
    [requestRecordCreationInContext, objectMetadataItem],
  );

  return { requestRecordCreation };
};
