import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useScrollTableToPosition } from '@/object-record/record-table/hooks/useScrollTableToPosition';
import { useProcessTreadmillScrollTop } from '@/object-record/record-table/virtualization/hooks/useProcessTreadmillScrollTop';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';

export const RecordTableNoRecordGroupScrollToPreviousRecordEffect = () => {
  const store = useStore();

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const allRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const { scrollTableToPosition } = useScrollTableToPosition();

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  const { processTreadmillScrollTop } = useProcessTreadmillScrollTop();

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

  useEffect(() => {
    // Read directly from the Jotai store to avoid stale values from useAtom's
    // internal useReducer, which can desync under high-frequency store updates.
    const lastShowPageRecordId = store.get(lastShowPageRecordIdState.atom);

    if (!isNonEmptyString(lastShowPageRecordId)) {
      return;
    }

    const run = async () => {
      store.set(lastShowPageRecordIdState.atom, null);

      const recordPosition = allRecordIds.findIndex(
        (recordId) => recordId === lastShowPageRecordId,
      );

      await triggerInitialRecordTableDataLoad();

      const { scrollWrapperElement } = getScrollWrapperElement();

      const tableScrollWrapperHeight = scrollWrapperElement?.clientHeight ?? 0;

      const numberOfRowsDisplayedInTable = Math.min(
        Math.floor(tableScrollWrapperHeight / (RECORD_TABLE_ROW_HEIGHT + 1)),
        30,
      );

      const halfNumberOfRowsVisible = Math.floor(
        numberOfRowsDisplayedInTable / 2,
      );

      const recordPositionInPx = recordPosition * (RECORD_TABLE_ROW_HEIGHT + 1);

      const targetScrollPositionInPx = Math.max(
        0,
        recordPositionInPx -
          halfNumberOfRowsVisible * (RECORD_TABLE_ROW_HEIGHT + 1),
      );

      scrollTableToPosition({
        horizontalScrollInPx: 0,
        verticalScrollInPx: targetScrollPositionInPx,
      });

      processTreadmillScrollTop(targetScrollPositionInPx);

      setHasInitializedScroll(true);

      await triggerFetchPagesWithoutDebounce();
    };

    run();
  }, [
    store,
    hasInitializedScroll,
    scrollTableToPosition,
    allRecordIds,
    triggerInitialRecordTableDataLoad,
    processTreadmillScrollTop,
    getScrollWrapperElement,
    triggerFetchPagesWithoutDebounce,
  ]);

  return <></>;
};
