import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RECORD_CREATION_FORM_MODAL_ID } from '@/object-record/record-form/components/RecordCreationFormModal';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const useStartRecordCreation = ({
  objectMetadataItem,
  instanceId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  instanceId?: string;
}) => {
  const { openModal } = useModal();

  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
    instanceId,
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

      await createNewIndexRecord(recordInput);
    },
    [createNewIndexRecord, openModal, shouldOpenRecordCreationForm],
  );

  return {
    startRecordCreation,
    shouldOpenRecordCreationForm,
    createNewIndexRecord,
  };
};
