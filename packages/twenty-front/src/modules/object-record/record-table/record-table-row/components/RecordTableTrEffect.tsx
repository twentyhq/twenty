import { isRowVisibleComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowVisibleComponentFamilyState';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { type RefObject, useEffect } from 'react';

type RecordTableTrEffectProps = {
  recordId: string;
  rowRef: RefObject<HTMLTableRowElement>;
};

export const RecordTableTrEffect = ({
  recordId,
  rowRef,
}: RecordTableTrEffectProps) => {
  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const setIsRowVisible = useSetRecoilComponentFamilyState(
    isRowVisibleComponentFamilyState,
    recordId,
  );

  useEffect(() => {
    const options = {
      root: scrollWrapperHTMLElement,
      rootMargin: '1000px',
      threshold: 0.1,
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting) {
          setIsRowVisible(true);
        }

        if (!isIntersecting) {
          setIsRowVisible(false);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [recordId, rowRef, scrollWrapperHTMLElement, setIsRowVisible]);

  return <></>;
};
