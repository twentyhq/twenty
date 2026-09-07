import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordCreationFormCancellationEffect } from '@/object-record/record-form/components/RecordCreationFormCancellationEffect';
import {
  RecordCreationFormContext,
  type RecordCreationFormContextValue,
} from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type PendingRecordCreation = {
  requestId: string;
  objectMetadataLabelSingular: string;
  createRecord: (draftRecord: Partial<ObjectRecord>) => Promise<ObjectRecord>;
  resolve: (createdRecord: ObjectRecord | null) => void;
  isSettling: boolean;
};

type RecordCreationFormProviderProps = {
  children: ReactNode;
};

export const RecordCreationFormProvider = ({
  children,
}: RecordCreationFormProviderProps) => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const [pendingRecordCreations, setPendingRecordCreations] = useState<
    PendingRecordCreation[]
  >([]);

  const settleRecordCreationDraft = useCallback(
    async ({
      requestId,
      draftRecord,
    }: {
      requestId: string;
      draftRecord: Partial<ObjectRecord> | null;
    }) => {
      const pendingRecordCreation = pendingRecordCreations.find(
        (candidate) => candidate.requestId === requestId,
      );

      if (
        !isDefined(pendingRecordCreation) ||
        pendingRecordCreation.isSettling
      ) {
        return;
      }

      if (draftRecord === null) {
        pendingRecordCreation.resolve(null);

        setPendingRecordCreations((previousPendingRecordCreations) =>
          previousPendingRecordCreations.filter(
            (candidate) => candidate.requestId !== requestId,
          ),
        );

        return;
      }

      setPendingRecordCreations((previousPendingRecordCreations) =>
        previousPendingRecordCreations.map((candidate) =>
          candidate.requestId === requestId
            ? { ...candidate, isSettling: true }
            : candidate,
        ),
      );

      try {
        const createdRecord =
          await pendingRecordCreation.createRecord(draftRecord);

        pendingRecordCreation.resolve(createdRecord);

        setPendingRecordCreations((previousPendingRecordCreations) =>
          previousPendingRecordCreations.filter(
            (candidate) => candidate.requestId !== requestId,
          ),
        );
      } catch {
        setPendingRecordCreations((previousPendingRecordCreations) =>
          previousPendingRecordCreations.map((candidate) =>
            candidate.requestId === requestId
              ? { ...candidate, isSettling: false }
              : candidate,
          ),
        );

        navigateSidePanelMenu({
          page: SidePanelPages.RecordCreationForm,
          pageTitle: t`New ${pendingRecordCreation.objectMetadataLabelSingular}`,
          pageIcon: IconPlus,
          pageId: requestId,
        });
      }
    },
    [navigateSidePanelMenu, pendingRecordCreations],
  );

  const requestRecordCreation = useCallback(
    ({
      objectMetadataItem,
      initialDraftRecord,
      createRecord,
    }: {
      objectMetadataItem: EnrichedObjectMetadataItem;
      initialDraftRecord?: Partial<ObjectRecord>;
      createRecord: (
        draftRecord: Partial<ObjectRecord>,
      ) => Promise<ObjectRecord>;
    }) => {
      const requestId = v4();

      store.set(
        recordCreationFormRequestComponentState.atomFamily({
          instanceId: requestId,
        }),
        {
          requestId,
          objectMetadataId: objectMetadataItem.id,
          initialDraftRecord: initialDraftRecord ?? {},
        },
      );

      return new Promise<ObjectRecord | null>((resolve) => {
        setPendingRecordCreations((previousPendingRecordCreations) => [
          ...previousPendingRecordCreations,
          {
            requestId,
            objectMetadataLabelSingular: objectMetadataItem.labelSingular,
            createRecord,
            resolve,
            isSettling: false,
          },
        ]);

        navigateSidePanelMenu({
          page: SidePanelPages.RecordCreationForm,
          pageTitle: t`New ${objectMetadataItem.labelSingular}`,
          pageIcon: IconPlus,
          pageId: requestId,
        });
      });
    },
    [navigateSidePanelMenu, store],
  );

  const cancelPendingRecordCreation = useCallback(
    ({ requestId }: { requestId: string }) => {
      settleRecordCreationDraft({ requestId, draftRecord: null });
    },
    [settleRecordCreationDraft],
  );

  const contextValue = useMemo<RecordCreationFormContextValue>(
    () => ({ requestRecordCreation, settleRecordCreationDraft }),
    [requestRecordCreation, settleRecordCreationDraft],
  );

  return (
    <RecordCreationFormContext.Provider value={contextValue}>
      {children}
      {pendingRecordCreations.map(({ requestId }) => (
        <RecordCreationFormCancellationEffect
          key={requestId}
          requestId={requestId}
          onCancel={cancelPendingRecordCreation}
        />
      ))}
    </RecordCreationFormContext.Provider>
  );
};
