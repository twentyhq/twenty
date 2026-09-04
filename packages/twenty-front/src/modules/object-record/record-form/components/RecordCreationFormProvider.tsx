import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordCreationFormModal } from '@/object-record/record-form/components/RecordCreationFormModal';
import { RECORD_CREATION_FORM_MODAL_ID } from '@/object-record/record-form/constants/RecordCreationFormModalId';
import {
  RecordCreationFormContext,
  type RecordCreationFormContextValue,
} from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type PendingRecordCreation = {
  key: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  initialDraftRecord?: Partial<ObjectRecord>;
  settle: (draftRecord: Partial<ObjectRecord> | null) => void;
};

type RecordCreationFormProviderProps = {
  children: ReactNode;
};

export const RecordCreationFormProvider = ({
  children,
}: RecordCreationFormProviderProps) => {
  const { openModal, closeModal } = useModal();

  const [pendingRecordCreation, setPendingRecordCreation] =
    useState<PendingRecordCreation | null>(null);

  const settlePendingRecordCreation = useCallback(
    (draftRecord: Partial<ObjectRecord> | null) => {
      setPendingRecordCreation(null);
      closeModal(RECORD_CREATION_FORM_MODAL_ID);

      pendingRecordCreation?.settle(draftRecord);
    },
    [closeModal, pendingRecordCreation],
  );

  const requestRecordCreationDraft = useCallback(
    ({
      objectMetadataItem,
      initialDraftRecord,
    }: {
      objectMetadataItem: EnrichedObjectMetadataItem;
      initialDraftRecord?: Partial<ObjectRecord>;
    }) => {
      pendingRecordCreation?.settle(null);

      return new Promise<Partial<ObjectRecord> | null>((resolve) => {
        // A new key remounts the modal, which is what discards the previous
        // draft and every field input's own internal value.
        setPendingRecordCreation({
          key: v4(),
          objectMetadataItem,
          initialDraftRecord,
          settle: resolve,
        });
        openModal(RECORD_CREATION_FORM_MODAL_ID);
      });
    },
    [openModal, pendingRecordCreation],
  );

  const contextValue = useMemo<RecordCreationFormContextValue>(
    () => ({ requestRecordCreationDraft }),
    [requestRecordCreationDraft],
  );

  return (
    <RecordCreationFormContext.Provider value={contextValue}>
      {children}
      {isDefined(pendingRecordCreation) && (
        <RecordCreationFormModal
          key={pendingRecordCreation.key}
          modalInstanceId={RECORD_CREATION_FORM_MODAL_ID}
          objectMetadataItem={pendingRecordCreation.objectMetadataItem}
          initialDraftRecord={pendingRecordCreation.initialDraftRecord}
          onSubmit={settlePendingRecordCreation}
          onCancel={() => settlePendingRecordCreation(null)}
        />
      )}
    </RecordCreationFormContext.Provider>
  );
};
