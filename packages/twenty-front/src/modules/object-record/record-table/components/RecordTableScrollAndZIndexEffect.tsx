import { shouldCompactRecordIndexLabelIdentifierComponentState } from '@/object-record/record-index/states/shouldCompactRecordIndexLabelIdentifierComponentState';
import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';

import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordTableScrollAndZIndexEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();
  const isMobile = useIsMobile();
  const [
    isRecordTableScrolledHorizontally,
    setIsRecordTableScrolledHorizontally,
  ] = useRecoilComponentStateV2(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const setShouldCompactRecordTableFirstColumn = useSetRecoilComponentStateV2(
    shouldCompactRecordTableFirstColumnComponentState,
  );

  const setShouldCompactRecordIndexLabelIdentifier =
    useSetRecoilComponentStateV2(
      shouldCompactRecordIndexLabelIdentifierComponentState,
    );

  const [isRecordTableScrolledVertically, setIsRecordTableScrolledVertically] =
    useRecoilComponentStateV2(isRecordTableScrolledVerticallyComponentState);

  useEffect(() => {
    if (!isDefined(scrollWrapperHTMLElement)) {
      return;
    }

    const handleScroll = (event: any) => {
      const target = event.currentTarget;

      const newIsScrolledVertically = target?.scrollTop > 0;

      if (newIsScrolledVertically !== isRecordTableScrolledVertically) {
        setIsRecordTableScrolledVertically(newIsScrolledVertically);

        const newVisibilityOfShadows = newIsScrolledVertically
          ? 'visible'
          : 'hidden';

        updateRecordTableCSSVariable(
          RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newVisibilityOfShadows,
        );
      }

      const newIsScrolledHorizontally = target?.scrollLeft > 0;

      if (newIsScrolledHorizontally !== isRecordTableScrolledHorizontally) {
        setIsRecordTableScrolledHorizontally(newIsScrolledHorizontally);

        const newVisibilityOfShadows = newIsScrolledHorizontally
          ? 'visible'
          : 'hidden';

        updateRecordTableCSSVariable(
          RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
          newVisibilityOfShadows,
        );

        if (isMobile) {
          if (newIsScrolledHorizontally) {
            setShouldCompactRecordTableFirstColumn(true);
            setShouldCompactRecordIndexLabelIdentifier(true);
          } else {
            setShouldCompactRecordTableFirstColumn(false);
            setShouldCompactRecordIndexLabelIdentifier(false);
          }
        }
      }
    };

    scrollWrapperHTMLElement?.addEventListener('scroll', handleScroll);

    return () => {
      scrollWrapperHTMLElement?.removeEventListener('scroll', handleScroll);
    };
  }, [
    scrollWrapperHTMLElement,
    isRecordTableScrolledVertically,
    isRecordTableScrolledHorizontally,
    setIsRecordTableScrolledVertically,
    setIsRecordTableScrolledHorizontally,
    isMobile,
    setShouldCompactRecordTableFirstColumn,
    setShouldCompactRecordIndexLabelIdentifier,
  ]);

  return <></>;
};
