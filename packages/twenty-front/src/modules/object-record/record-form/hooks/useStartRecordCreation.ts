import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RECORD_CREATION_FORM_MODAL_ID } from '@/object-record/record-form/components/RecordCreationFormModal';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useStartRecordCreation = ({
  objectMetadataItem,
  onCreateRecord,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  onCreateRecord: (recordInput?: Partial<ObjectRecord>) => Promise<void>;
}) => {
  const { openModal } = useModal();

  const [pendingRecordInput, setPendingRecordInput] = useState<
    Partial<ObjectRecord> | undefined
  >(undefined);
  const [recordCreationFormKey, setRecordCreationFormKey] = useState(() =>
    v4(),
  );

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
        setPendingRecordInput(recordInput);
        // A new key remounts the modal, which is what discards the previous
        // draft and every field input's own internal value.
        setRecordCreationFormKey(v4());
        openModal(RECORD_CREATION_FORM_MODAL_ID);

        return;
      }

      await onCreateRecord(recordInput);
    },
    [onCreateRecord, openModal, shouldOpenRecordCreationForm],
  );

  return {
    startRecordCreation,
    shouldOpenRecordCreationForm,
    pendingRecordInput,
    recordCreationFormKey,
  };
};
