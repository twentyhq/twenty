import { shouldCompactRecordIndexLabelIdentifierComponentState } from '@/object-record/record-index/states/shouldCompactRecordIndexLabelIdentifierComponentState';
import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';

import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

import { useCallback, useEffect } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

// OMNIA-CUSTOM: Rewrote scroll handler to use jotai store.get()/store.set()
// instead of reactive hooks. The original closed over isRecordTableScrolledVertically
// and isRecordTableScrolledHorizontally in the useEffect dependency array, causing
// the scroll listener to be torn down and re-attached on every scroll state change.
// On mobile Safari with momentum scrolling this created a feedback loop that crashed
// the browser. Using store.get() reads the current value without subscribing, keeping
// the handler reference stable and the useEffect deps minimal.
export const RecordTableScrollAndZIndexEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();
  const isMobile = useIsMobile();
  const store = useStore();

  const isScrolledHorizontallyCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableScrolledHorizontallyComponentState,
    );

  const isScrolledVerticallyCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableScrolledVerticallyComponentState,
    );

  const shouldCompactFirstColumnCallbackState =
    useAtomComponentStateCallbackState(
      shouldCompactRecordTableFirstColumnComponentState,
    );

  const shouldCompactLabelIdentifierCallbackState =
    useAtomComponentStateCallbackState(
      shouldCompactRecordIndexLabelIdentifierComponentState,
    );

  const handleScroll = useCallback(
    (event: Event) => {
      const target = event.currentTarget as HTMLElement | null;

      const newIsScrolledVertically = (target?.scrollTop ?? 0) > 0;
      const prevIsScrolledVertically = store.get(
        isScrolledVerticallyCallbackState,
      );

      if (newIsScrolledVertically !== prevIsScrolledVertically) {
        store.set(isScrolledVerticallyCallbackState, newIsScrolledVertically);

        updateRecordTableCSSVariable(
          RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newIsScrolledVertically ? 'visible' : 'hidden',
        );
      }

      const newIsScrolledHorizontally = (target?.scrollLeft ?? 0) > 0;
      const prevIsScrolledHorizontally = store.get(
        isScrolledHorizontallyCallbackState,
      );

      if (newIsScrolledHorizontally !== prevIsScrolledHorizontally) {
        store.set(
          isScrolledHorizontallyCallbackState,
          newIsScrolledHorizontally,
        );

        updateRecordTableCSSVariable(
          RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newIsScrolledHorizontally ? 'visible' : 'hidden',
        );

        if (isMobile) {
          store.set(
            shouldCompactFirstColumnCallbackState,
            newIsScrolledHorizontally,
          );
          store.set(
            shouldCompactLabelIdentifierCallbackState,
            newIsScrolledHorizontally,
          );
        }
      }
    },
    [
      store,
      isScrolledVerticallyCallbackState,
      isScrolledHorizontallyCallbackState,
      shouldCompactFirstColumnCallbackState,
      shouldCompactLabelIdentifierCallbackState,
      isMobile,
    ],
  );

  useEffect(() => {
    if (!isDefined(scrollWrapperHTMLElement)) {
      return;
    }

    scrollWrapperHTMLElement.addEventListener('scroll', handleScroll);

    return () => {
      scrollWrapperHTMLElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollWrapperHTMLElement, handleScroll]);

  return <></>;
};
