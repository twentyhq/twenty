import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';

import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollAndZIndexEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const setIsRecordTableScrolledHorizontally = useSetRecoilComponentState(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const setIsRecordTableScrolledVertically = useSetRecoilComponentState(
    isRecordTableScrolledVerticallyComponentState,
  );

  const [isScrolledVertically, setIsScrolledVertically] = useState(false);
  const [isScrolledHorizontally, setIsScrolledHorizontally] = useState(false);

  useEffect(() => {
    if (!isDefined(scrollWrapperHTMLElement)) {
      return;
    }

    const handleScroll = (event: any) => {
      const target = event.currentTarget;

      let somethingHasChanged = false;

      const newIsScrolledVertically = target?.scrollTop > 0;

      if (newIsScrolledVertically !== isScrolledVertically) {
        setIsScrolledVertically(newIsScrolledVertically);
        setIsRecordTableScrolledVertically(newIsScrolledVertically);
        somethingHasChanged = true;
      }

      const newIsScrolledHorizontally = target?.scrollLeft > 0;

      if (newIsScrolledHorizontally !== isScrolledHorizontally) {
        setIsScrolledHorizontally(newIsScrolledHorizontally);
        setIsRecordTableScrolledHorizontally(newIsScrolledHorizontally);
        somethingHasChanged = true;
      }

      if (!somethingHasChanged) {
        return;
      }

      if (newIsScrolledHorizontally !== isScrolledHorizontally) {
        const newVisibilityOfShadows = newIsScrolledHorizontally
          ? 'visible'
          : 'hidden';

        updateRecordTableCSSVariable(
          RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newVisibilityOfShadows,
        );
      }

      if (newIsScrolledVertically !== isScrolledVertically) {
        const newVisibilityOfShadows = newIsScrolledVertically
          ? 'visible'
          : 'hidden';

        updateRecordTableCSSVariable(
          RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newVisibilityOfShadows,
        );
      }
    };

    scrollWrapperHTMLElement?.addEventListener('scroll', handleScroll);

    return () => {
      scrollWrapperHTMLElement?.removeEventListener('scroll', handleScroll);
    };
  }, [
    scrollWrapperHTMLElement,
    isScrolledVertically,
    isScrolledHorizontally,
    setIsRecordTableScrolledVertically,
    setIsRecordTableScrolledHorizontally,
  ]);

  return <></>;
};
