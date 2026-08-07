import { recordListDisplayedFieldCountComponentState } from '@/object-record/record-list/states/recordListDisplayedFieldCountComponentState';
import { computeRecordListDisplayedFieldCount } from '@/object-record/record-list/utils/computeRecordListDisplayedFieldCount';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type RefObject, useLayoutEffect } from 'react';

type RecordListResponsiveFieldCountEffectProps = {
  containerRef: RefObject<HTMLElement | null>;
};

export const RecordListResponsiveFieldCountEffect = ({
  containerRef,
}: RecordListResponsiveFieldCountEffectProps) => {
  const setRecordListDisplayedFieldCount = useSetAtomComponentState(
    recordListDisplayedFieldCountComponentState,
  );

  useLayoutEffect(() => {
    const containerElement = containerRef.current;

    if (containerElement === null) {
      return;
    }

    const updateDisplayedFieldCount = () => {
      setRecordListDisplayedFieldCount(
        computeRecordListDisplayedFieldCount(containerElement.clientWidth),
      );
    };

    updateDisplayedFieldCount();

    const resizeObserver = new ResizeObserver(updateDisplayedFieldCount);

    resizeObserver.observe(containerElement);

    return () => resizeObserver.disconnect();
  }, [containerRef, setRecordListDisplayedFieldCount]);

  return null;
};
