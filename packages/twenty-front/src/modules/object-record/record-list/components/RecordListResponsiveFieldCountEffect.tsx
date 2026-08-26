import { recordListDisplayedFieldCountComponentState } from '@/object-record/record-list/states/recordListDisplayedFieldCountComponentState';
import { computeRecordListDisplayedFieldCount } from '@/object-record/record-list/utils/computeRecordListDisplayedFieldCount';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordListResponsiveFieldCountEffectProps = {
  containerElement: HTMLElement | null;
};

// Takes the element rather than a ref object. React attaches a host element's
// ref only after the layout effects of its children have run, so reading the
// parent's ref here on mount finds null and nothing re-runs the effect once it
// is filled — the list would keep its default field count. A callback ref
// stored in state re-renders instead, and the effect measures the real element.
export const RecordListResponsiveFieldCountEffect = ({
  containerElement,
}: RecordListResponsiveFieldCountEffectProps) => {
  const setRecordListDisplayedFieldCount = useSetAtomComponentState(
    recordListDisplayedFieldCountComponentState,
  );

  useLayoutEffect(() => {
    if (!isDefined(containerElement)) {
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
  }, [containerElement, setRecordListDisplayedFieldCount]);

  return null;
};
