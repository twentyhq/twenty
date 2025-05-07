import { isRowVisibleComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowVisibleComponentFamilyState';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { useEffect } from 'react';

type RecordTableTrEffectProps = {
  recordId: string;
};

export const RecordTableTrEffect = ({ recordId }: RecordTableTrEffectProps) => {
  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const setIsRowVisible = useSetRecoilComponentFamilyStateV2(
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

    observer.observe(
      document.querySelector(
        `[data-virtualized-id="${recordId}"]`,
      ) as HTMLElement,
    );

    return () => {
      observer.disconnect();
    };
  }, [recordId, scrollWrapperHTMLElement, setIsRowVisible]);

  return <></>;
};
