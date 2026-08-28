import { RECORD_TABLE_FIRST_COLUMN_COLLAPSE_SCROLL_MARGIN } from '@/object-record/record-table/constants/RecordTableFirstColumnCollapseScrollMargin';
import { RECORD_TABLE_FIRST_COLUMN_EXPAND_SCROLL_THRESHOLD } from '@/object-record/record-table/constants/RecordTableFirstColumnExpandScrollThreshold';
import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeRecordTableLabelIdentifierColumnWidthOnMobile } from '@/object-record/record-table/utils/computeRecordTableLabelIdentifierColumnWidthOnMobile';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';

import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { addScrollEndListener } from '@/ui/utilities/scroll/utils/addScrollEndListener';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

import { useStore } from 'jotai';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordTableScrollAndZIndexEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();
  const isMobile = useIsMobile();
  const store = useStore();

  const [
    isRecordTableScrolledHorizontally,
    setIsRecordTableScrolledHorizontally,
  ] = useAtomComponentState(isRecordTableScrolledHorizontallyComponentState);

  const [isRecordTableScrolledVertically, setIsRecordTableScrolledVertically] =
    useAtomComponentState(isRecordTableScrolledVerticallyComponentState);

  // Read through the store rather than subscribing: re-running the scroll end
  // effect on every toggle would drop the pending debounce of the fallback
  // listener, swallowing the scroll end that follows our own scroll fix-up.
  const shouldCompactRecordTableFirstColumnCallbackState =
    useAtomComponentStateCallbackState(
      shouldCompactRecordTableFirstColumnComponentState,
    );

  const setShouldCompactRecordTableFirstColumn = useSetAtomComponentState(
    shouldCompactRecordTableFirstColumnComponentState,
  );

  const recordTableWidth = useAtomComponentStateValue(
    recordTableWidthComponentState,
  );

  useEffect(() => {
    if (!isDefined(scrollWrapperHTMLElement)) {
      return;
    }

    const handleScroll = (event: Event) => {
      const target = event.currentTarget as HTMLElement;

      const newIsScrolledVertically = target.scrollTop > 0;

      if (newIsScrolledVertically !== isRecordTableScrolledVertically) {
        setIsRecordTableScrolledVertically(newIsScrolledVertically);

        updateRecordTableCSSVariable(
          recordTableId,
          RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newIsScrolledVertically ? 'visible' : 'hidden',
        );
      }

      const newIsScrolledHorizontally = target.scrollLeft > 0;

      if (newIsScrolledHorizontally !== isRecordTableScrolledHorizontally) {
        setIsRecordTableScrolledHorizontally(newIsScrolledHorizontally);

        updateRecordTableCSSVariable(
          recordTableId,
          RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newIsScrolledHorizontally ? 'visible' : 'hidden',
        );
      }
    };

    scrollWrapperHTMLElement.addEventListener('scroll', handleScroll);

    return () => {
      scrollWrapperHTMLElement.removeEventListener('scroll', handleScroll);
    };
  }, [
    recordTableId,
    scrollWrapperHTMLElement,
    isRecordTableScrolledVertically,
    isRecordTableScrolledHorizontally,
    setIsRecordTableScrolledVertically,
    setIsRecordTableScrolledHorizontally,
  ]);

  useEffect(() => {
    if (!isMobile || !isDefined(scrollWrapperHTMLElement)) {
      return;
    }

    const expandedWidth = computeRecordTableLabelIdentifierColumnWidthOnMobile({
      tableWidth: recordTableWidth,
      isCollapsed: false,
    });

    const collapsedWidth = computeRecordTableLabelIdentifierColumnWidthOnMobile(
      { tableWidth: recordTableWidth, isCollapsed: true },
    );

    const widthDelta = expandedWidth - collapsedWidth;

    // Our own scroll fix-up below emits a scroll end of its own; skipping it
    // keeps the collapse from immediately re-evaluating against the offset we
    // just wrote.
    let isAdjustingScrollLeft = false;

    // Collapsing hands `widthDelta` of scroll offset back, so collapsing any
    // sooner would land the table inside the expand zone and flip it open
    // again on the very next scroll end.
    const collapseScrollThreshold =
      widthDelta +
      RECORD_TABLE_FIRST_COLUMN_EXPAND_SCROLL_THRESHOLD +
      RECORD_TABLE_FIRST_COLUMN_COLLAPSE_SCROLL_MARGIN;

    const handleScrollEnd = () => {
      if (isAdjustingScrollLeft) {
        isAdjustingScrollLeft = false;
        return;
      }

      const scrollLeft = scrollWrapperHTMLElement.scrollLeft;

      const shouldCompact = store.get(
        shouldCompactRecordTableFirstColumnCallbackState,
      );

      const nextShouldCompact = shouldCompact
        ? scrollLeft > RECORD_TABLE_FIRST_COLUMN_EXPAND_SCROLL_THRESHOLD
        : scrollLeft > collapseScrollThreshold;

      if (nextShouldCompact === shouldCompact) {
        return;
      }

      // Resizing the frozen column reflows every column after it. Committing
      // the width synchronously lets the scroll offset absorb that shift in
      // the same frame, so the data columns stay where the user left them.
      flushSync(() => {
        setShouldCompactRecordTableFirstColumn(nextShouldCompact);
      });

      const nextScrollLeft = nextShouldCompact
        ? Math.max(0, scrollLeft - widthDelta)
        : 0;

      if (nextScrollLeft !== scrollWrapperHTMLElement.scrollLeft) {
        isAdjustingScrollLeft = true;
        scrollWrapperHTMLElement.scrollLeft = nextScrollLeft;
      }
    };

    return addScrollEndListener(scrollWrapperHTMLElement, handleScrollEnd);
  }, [
    isMobile,
    scrollWrapperHTMLElement,
    recordTableWidth,
    store,
    shouldCompactRecordTableFirstColumnCallbackState,
    setShouldCompactRecordTableFirstColumn,
  ]);

  return <></>;
};
