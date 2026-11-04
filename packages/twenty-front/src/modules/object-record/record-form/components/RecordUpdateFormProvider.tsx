import { RecordCreationFormCancellationEffect } from '@/object-record/record-form/components/RecordCreationFormCancellationEffect';
import {
  RecordUpdateFormContextProvider,
  type RecordUpdateFormContextValue,
} from '@/object-record/record-form/contexts/RecordUpdateFormContext';
import { type RecordUpdateFormCompletionRequest } from '@/object-record/record-form/types/RecordUpdateFormCompletionRequest';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { recordUpdateFormRequestComponentState } from '@/side-panel/pages/record-update-form/states/recordUpdateFormRequestComponentState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconEdit } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type PendingRecordUpdateForm = {
  requestId: string;
  resolve: (completedFields: Partial<ObjectRecord> | null) => void;
};

type RecordUpdateFormProviderProps = {
  children: ReactNode;
};

export const RecordUpdateFormProvider = ({
  children,
}: RecordUpdateFormProviderProps) => {
  const store = useStore();
  const { removePageFromSidePanelHistory } = useSidePanelHistory();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const [pendingRecordUpdateForms, setPendingRecordUpdateForms] = useState<
    PendingRecordUpdateForm[]
  >([]);

  const settleRecordUpdateForm = useCallback(
    ({
      requestId,
      completedFields,
    }: {
      requestId: string;
      completedFields: Partial<ObjectRecord> | null;
    }) => {
      const pendingRecordUpdateForm = pendingRecordUpdateForms.find(
        (candidate) => candidate.requestId === requestId,
      );

      if (!isDefined(pendingRecordUpdateForm)) {
        return;
      }

      if (isDefined(completedFields)) {
        removePageFromSidePanelHistory(requestId);
      }

      pendingRecordUpdateForm.resolve(completedFields);

      setPendingRecordUpdateForms((previousPendingRecordUpdateForms) =>
        previousPendingRecordUpdateForms.filter(
          (candidate) => candidate.requestId !== requestId,
        ),
      );
    },
    [pendingRecordUpdateForms, removePageFromSidePanelHistory],
  );

  const requestRecordUpdateFormCompletion = useCallback(
    ({
      objectMetadataItem,
      draftRecord,
      fieldMetadataIds,
      violations,
    }: RecordUpdateFormCompletionRequest) => {
      // One form at a time: further updates, like the rest of a multi-card drop, go to the server unchanged
      if (pendingRecordUpdateForms.length > 0) {
        return Promise.resolve({});
      }

      const requestId = v4();

      closeAnyOpenDropdown();

      store.set(
        recordUpdateFormRequestComponentState.atomFamily({
          instanceId: requestId,
        }),
        {
          requestId,
          objectMetadataId: objectMetadataItem.id,
          draftRecord,
          fieldMetadataIds,
          violations,
        },
      );

      return new Promise<Partial<ObjectRecord> | null>((resolve) => {
        setPendingRecordUpdateForms((previousPendingRecordUpdateForms) => [
          ...previousPendingRecordUpdateForms,
          { requestId, resolve },
        ]);

        navigateSidePanelMenu({
          page: SidePanelPages.RecordUpdateForm,
          pageTitle: t`Update ${objectMetadataItem.labelSingular}`,
          pageIcon: IconEdit,
          pageId: requestId,
        });
      });
    },
    [
      closeAnyOpenDropdown,
      navigateSidePanelMenu,
      pendingRecordUpdateForms.length,
      store,
    ],
  );

  const cancelPendingRecordUpdateForm = useCallback(
    ({ requestId }: { requestId: string }) => {
      settleRecordUpdateForm({ requestId, completedFields: null });
    },
    [settleRecordUpdateForm],
  );

  const contextValue = useMemo<RecordUpdateFormContextValue>(
    () => ({ requestRecordUpdateFormCompletion, settleRecordUpdateForm }),
    [requestRecordUpdateFormCompletion, settleRecordUpdateForm],
  );

  return (
    <RecordUpdateFormContextProvider value={contextValue}>
      {children}
      {pendingRecordUpdateForms.map(({ requestId }) => (
        <RecordCreationFormCancellationEffect
          key={requestId}
          requestId={requestId}
          onCancel={cancelPendingRecordUpdateForm}
        />
      ))}
    </RecordUpdateFormContextProvider>
  );
};
