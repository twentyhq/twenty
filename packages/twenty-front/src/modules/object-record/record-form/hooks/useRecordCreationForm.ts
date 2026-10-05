import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useRecordCreationForm = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { requestRecordCreation: requestRecordCreationInContext } =
    useRecordCreationFormContextOrThrow();

  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );

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

  return { isRecordCreationFormEnabled, requestRecordCreation };
};
