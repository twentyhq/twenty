import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';

import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollAndZIndexEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const [
    isRecordTableScrolledHorizontally,
    setIsRecordTableScrolledHorizontally,
  ] = useAtomComponentState(isRecordTableScrolledHorizontallyComponentState);

  const [isRecordTableScrolledVertically, setIsRecordTableScrolledVertically] =
    useAtomComponentState(isRecordTableScrolledVerticallyComponentState);

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

  return <></>;
};
