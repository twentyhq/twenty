import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';

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

      // TODO: insert imperative CSS update here
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
