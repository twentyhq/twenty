import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { useLazyFindRecordPositionInIndex } from '@/object-record/record-index/hooks/useLazyFindRecordPositionInIndex';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useScrollTableToPosition } from '@/object-record/record-table/hooks/useScrollTableToPosition';
import { useProcessTreadmillScrollTop } from '@/object-record/record-table/virtualization/hooks/useProcessTreadmillScrollTop';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableNoRecordGroupScrollToPreviousRecordEffect = () => {
  const store = useStore();

  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const lastShowPageRecordIdAtom = useAtomComponentStateCallbackState(
    lastShowPageRecordIdState,
  );

  // Subscribed only to re-run the effect when a record gets targeted while the
  // table is already mounted; the effect reads the value from the store.
  const lastShowPageRecordId = useAtomComponentStateValue(
    lastShowPageRecordIdState,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const allRecordIdsCallbackState = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { scrollTableToPosition } = useScrollTableToPosition();

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  const { processTreadmillScrollTop } = useProcessTreadmillScrollTop();

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

  const { findRecordPositionInIndex } =
    useLazyFindRecordPositionInIndex(objectNameSingular);

  const { focusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  useEffect(() => {
    // Read directly from the Jotai store to avoid stale values from useAtom's
    // internal useReducer, which can desync under high-frequency store updates.
    const recordIdToReveal = store.get(lastShowPageRecordIdAtom);

    if (!isNonEmptyString(recordIdToReveal)) {
      return;
    }

    const run = async () => {
      store.set(lastShowPageRecordIdAtom, null);

      const [, recordPositionInIndex] = await Promise.all([
        triggerInitialRecordTableDataLoad(),
        findRecordPositionInIndex(recordIdToReveal),
      ]);

      const loadedRecordPosition = store
        .get(allRecordIdsCallbackState)
        .indexOf(recordIdToReveal);

      const recordPosition =
        loadedRecordPosition !== -1
          ? loadedRecordPosition
          : recordPositionInIndex;

      if (!isDefined(recordPosition)) {
        return;
      }

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

      await triggerFetchPagesWithoutDebounce();

      // The counted position can drift from the scan order on sparse sort
      // fields, so locate the record among the rows loaded around it.
      const revealedRowIndex = store
        .get(allRecordIdsCallbackState)
        .indexOf(recordIdToReveal);

      if (revealedRowIndex !== -1) {
        focusRecordTableRow(revealedRowIndex);
      }
    };

    run();
  }, [
    store,
    lastShowPageRecordIdAtom,
    lastShowPageRecordId,
    allRecordIdsCallbackState,
    scrollTableToPosition,
    triggerInitialRecordTableDataLoad,
    processTreadmillScrollTop,
    getScrollWrapperElement,
    triggerFetchPagesWithoutDebounce,
    findRecordPositionInIndex,
    focusRecordTableRow,
  ]);

  return <></>;
};
