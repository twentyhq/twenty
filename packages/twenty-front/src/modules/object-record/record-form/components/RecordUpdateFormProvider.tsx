import { SidePanelFormCancellationEffect } from '@/object-record/record-form/components/SidePanelFormCancellationEffect';
import {
  RecordUpdateFormContextProvider,
  type RecordUpdateFormContextValue,
} from '@/object-record/record-form/contexts/RecordUpdateFormContext';
import { type RecordUpdateFormCompletionRequest } from '@/object-record/record-form/types/RecordUpdateFormCompletionRequest';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { pendingRecordUpdateFormState } from '@/object-record/record-form/states/pendingRecordUpdateFormState';
import { recordUpdateFormRequestComponentState } from '@/side-panel/pages/record-update-form/states/recordUpdateFormRequestComponentState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { type ReactNode, useCallback, useMemo } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconEdit } from 'twenty-ui/icon';
import { v4 } from 'uuid';

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

  const pendingRecordUpdateForm = useAtomStateValue(
    pendingRecordUpdateFormState,
  );

  const settleRecordUpdateForm = useCallback(
    ({
      requestId,
      completedFields,
    }: {
      requestId: string;
      completedFields: Partial<ObjectRecord> | null;
    }) => {
      const settlingRecordUpdateForm = store.get(
        pendingRecordUpdateFormState.atom,
      );

      if (settlingRecordUpdateForm?.requestId !== requestId) {
        return;
      }

      store.set(pendingRecordUpdateFormState.atom, null);

      if (isDefined(completedFields)) {
        removePageFromSidePanelHistory(requestId);
      }

      settlingRecordUpdateForm.resolve(completedFields);
    },
    [removePageFromSidePanelHistory, store],
  );

  const requestRecordUpdateFormCompletion = useCallback(
    ({
      objectMetadataItem,
      draftRecord,
      previousRecord,
      fieldMetadataIds,
      violations,
    }: RecordUpdateFormCompletionRequest) => {
      if (isDefined(store.get(pendingRecordUpdateFormState.atom))) {
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
          previousRecord,
          fieldMetadataIds,
          violations,
        },
      );

      return new Promise<Partial<ObjectRecord> | null>((resolve) => {
        store.set(pendingRecordUpdateFormState.atom, { requestId, resolve });

        navigateSidePanelMenu({
          page: SidePanelPages.RecordUpdateForm,
          pageTitle: t`Update ${objectMetadataItem.labelSingular}`,
          pageIcon: IconEdit,
          pageId: requestId,
        });
      });
    },
    [closeAnyOpenDropdown, navigateSidePanelMenu, store],
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
      {isDefined(pendingRecordUpdateForm) && (
        <SidePanelFormCancellationEffect
          key={pendingRecordUpdateForm.requestId}
          requestId={pendingRecordUpdateForm.requestId}
          onCancel={cancelPendingRecordUpdateForm}
        />
      )}
    </RecordUpdateFormContextProvider>
  );
};
