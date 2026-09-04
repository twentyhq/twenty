import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  RecordCreationFormContext,
  type RecordCreationFormContextValue,
} from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type PendingRecordCreation = {
  requestId: string;
  settle: (draftRecord: Partial<ObjectRecord> | null) => void;
};

type RecordCreationFormProviderProps = {
  children: ReactNode;
};

export const RecordCreationFormProvider = ({
  children,
}: RecordCreationFormProviderProps) => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const [, setPendingRecordCreation] = useState<PendingRecordCreation | null>(
    null,
  );

  const settleRecordCreationDraft = useCallback(
    ({
      requestId,
      draftRecord,
    }: {
      requestId: string;
      draftRecord: Partial<ObjectRecord> | null;
    }) => {
      setPendingRecordCreation((pendingRecordCreation) => {
        if (pendingRecordCreation?.requestId !== requestId) {
          return pendingRecordCreation;
        }

        pendingRecordCreation.settle(draftRecord);

        return null;
      });
    },
    [],
  );

  const requestRecordCreationDraft = useCallback(
    ({
      objectMetadataItem,
      initialDraftRecord,
    }: {
      objectMetadataItem: EnrichedObjectMetadataItem;
      initialDraftRecord?: Partial<ObjectRecord>;
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

      return new Promise<Partial<ObjectRecord> | null>((resolve) => {
        setPendingRecordCreation((previousRecordCreation) => {
          previousRecordCreation?.settle(null);

          return { requestId, settle: resolve };
        });

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

  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );

  useEffect(() => {
    setPendingRecordCreation((pendingRecordCreation) => {
      if (!isDefined(pendingRecordCreation)) {
        return pendingRecordCreation;
      }

      const isFormStillOpen = sidePanelNavigationStack.some(
        ({ pageId }) => pageId === pendingRecordCreation.requestId,
      );

      if (isFormStillOpen) {
        return pendingRecordCreation;
      }

      pendingRecordCreation.settle(null);

      return null;
    });
  }, [sidePanelNavigationStack]);

  const contextValue = useMemo<RecordCreationFormContextValue>(
    () => ({ requestRecordCreationDraft, settleRecordCreationDraft }),
    [requestRecordCreationDraft, settleRecordCreationDraft],
  );

  return (
    <RecordCreationFormContext.Provider value={contextValue}>
      {children}
    </RecordCreationFormContext.Provider>
  );
};
