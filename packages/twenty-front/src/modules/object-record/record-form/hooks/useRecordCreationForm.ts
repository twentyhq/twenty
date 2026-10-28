import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordCreationFormContextOrThrow } from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type RecordCreationRequest } from '@/object-record/record-form/types/RecordCreationRequest';
import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useRecordCreationForm = () => {
  const { requestRecordCreation } = useRecordCreationFormContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();

  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );

  const createRecordWithOptionalForm = useCallback(
    (request: RecordCreationRequest) => {
      if (isRecordCreationFormEnabled) {
        return requestRecordCreation(request);
      }

      return request.createRecord(
        computeRecordFormCreateRecordInput({
          draftRecord: request.initialDraftRecord ?? {},
          fieldMetadataItems: request.objectMetadataItem.fields,
          objectMetadataItems,
        }),
      );
    },
    [isRecordCreationFormEnabled, objectMetadataItems, requestRecordCreation],
  );

  return {
    isRecordCreationFormEnabled,
    requestRecordCreation,
    createRecordWithOptionalForm,
  };
};
