import { useStore } from 'jotai';
import { type RefObject, useCallback } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexDisplayedRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexDisplayedRecordIdsComponentSelector';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

type UseRecordSelectionArrowKeyNavigationProps = {
  selectableItemsContainerRef: RefObject<HTMLElement | null>;
  activeRecordId: string | undefined;
  onActiveRecordChange: (recordId: string) => void;
  onEndReached: () => void;
};

export const useRecordSelectionArrowKeyNavigation = ({
  selectableItemsContainerRef,
  activeRecordId,
  onActiveRecordChange,
  onEndReached,
}: UseRecordSelectionArrowKeyNavigationProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
  );

  const displayedRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexDisplayedRecordIdsComponentSelector,
    instanceId,
  );

  const recordSelectionRange = useAtomComponentStateCallbackState(
    recordSelectionRangeComponentState,
    instanceId,
  );

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
    instanceId,
  );

  const { toggleRecordSelection } = useToggleRecordSelection(instanceId);
  const { resetRecordSelection } = useResetRecordSelection(instanceId);

  const store = useStore();

  const navigateWithArrowKey = useCallback(
    (keyboardEvent: KeyboardEvent) => {
      const recordIds = store.get(displayedRecordIds);
      const range = store.get(recordSelectionRange);

      const cursorRecordId = [range?.headRecordId, activeRecordId].find(
        (recordId) => isDefined(recordId) && recordIds.includes(recordId),
      );

      const cursorIndex = isDefined(cursorRecordId)
        ? recordIds.indexOf(cursorRecordId)
        : -1;

      const targetRecordId =
        cursorIndex === -1
          ? recordIds[0]
          : recordIds[
              cursorIndex + (keyboardEvent.key === Key.ArrowUp ? -1 : 1)
            ];

      if (!isDefined(targetRecordId)) {
        if (keyboardEvent.key === Key.ArrowDown) {
          onEndReached();
        }

        return;
      }

      if (!keyboardEvent.shiftKey) {
        resetRecordSelection();
        onActiveRecordChange(targetRecordId);
      } else if (isDefined(range) && range.headRecordId === cursorRecordId) {
        toggleRecordSelection({
          recordId: targetRecordId,
          shouldSelectRange: true,
        });
      } else {
        const anchorRecordId = cursorRecordId ?? targetRecordId;

        store.set(isRecordSelectedFamilyState(anchorRecordId), true);
        store.set(recordSelectionRange, {
          anchorRecordId,
          headRecordId: anchorRecordId,
          addedRecordIds: [],
        });

        if (anchorRecordId !== targetRecordId) {
          toggleRecordSelection({
            recordId: targetRecordId,
            shouldSelectRange: true,
          });
        }
      }

      selectableItemsContainerRef.current
        ?.querySelector(`[data-selectable-id="${targetRecordId}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    },
    [
      activeRecordId,
      displayedRecordIds,
      isRecordSelectedFamilyState,
      onActiveRecordChange,
      onEndReached,
      recordSelectionRange,
      resetRecordSelection,
      selectableItemsContainerRef,
      store,
      toggleRecordSelection,
    ],
  );

  return { navigateWithArrowKey };
};
