import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  RecordCreationFormContext,
  type RecordCreationFormContextValue,
} from '@/object-record/record-form/contexts/RecordCreationFormContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { useStore } from 'jotai';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type RecordCreationFormProviderProps = {
  children: ReactNode;
};

export const RecordCreationFormProvider = ({
  children,
}: RecordCreationFormProviderProps) => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const [settlePendingDraft, setSettlePendingDraft] = useState<
    ((draftRecord: Partial<ObjectRecord> | null) => void) | null
  >(null);

  const settleRecordCreationDraft = useCallback(
    (draftRecord: Partial<ObjectRecord> | null) => {
      setSettlePendingDraft(null);
      settlePendingDraft?.(draftRecord);
    },
    [settlePendingDraft],
  );

  const requestRecordCreationDraft = useCallback(
    ({
      objectMetadataItem,
      initialDraftRecord,
    }: {
      objectMetadataItem: EnrichedObjectMetadataItem;
      initialDraftRecord?: Partial<ObjectRecord>;
    }) => {
      settlePendingDraft?.(null);

      const pageId = v4();

      store.set(
        recordCreationFormRequestComponentState.atomFamily({
          instanceId: pageId,
        }),
        {
          objectMetadataId: objectMetadataItem.id,
          initialDraftRecord: initialDraftRecord ?? {},
        },
      );

      navigateSidePanelMenu({
        page: SidePanelPages.RecordCreationForm,
        pageTitle: t`New ${objectMetadataItem.labelSingular}`,
        pageIcon: IconPlus,
        pageId,
      });

      return new Promise<Partial<ObjectRecord> | null>((resolve) => {
        setSettlePendingDraft(() => resolve);
      });
    },
    [navigateSidePanelMenu, settlePendingDraft, store],
  );

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
