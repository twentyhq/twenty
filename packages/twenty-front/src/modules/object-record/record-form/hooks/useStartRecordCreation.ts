import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RECORD_CREATION_FORM_MODAL_ID } from '@/object-record/record-form/components/RecordCreationFormModal';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

// The caller keeps ownership of what happens after creation, so deferring the
// save behind a form must not swallow its continuation.
export const useStartRecordCreation = ({
  objectMetadataItem,
  onCreateRecord,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  onCreateRecord: (recordInput?: Partial<ObjectRecord>) => Promise<void>;
}) => {
  const { openModal } = useModal();

  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const shouldOpenRecordCreationForm =
    isRecordCreationFormEnabled &&
    isNonEmptyArray(recordFormFieldMetadataItems);

  const startRecordCreation = useCallback(
    async (recordInput?: Partial<ObjectRecord>) => {
      if (shouldOpenRecordCreationForm) {
        openModal(RECORD_CREATION_FORM_MODAL_ID);

        return;
      }

      await onCreateRecord(recordInput);
    },
    [onCreateRecord, openModal, shouldOpenRecordCreationForm],
  );

  return { startRecordCreation, shouldOpenRecordCreationForm };
};
