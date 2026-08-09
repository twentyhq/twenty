import { recordListDisplayedFieldCountComponentState } from '@/object-record/record-list/states/recordListDisplayedFieldCountComponentState';
import { computeRecordListDisplayedFieldCount } from '@/object-record/record-list/utils/computeRecordListDisplayedFieldCount';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordListResponsiveFieldCountEffectProps = {
  containerElement: HTMLElement | null;
};

// Takes the element rather than a ref: React attaches a parent's ref only after
// its children's layout effects have run, so a ref read here on mount is still
// null and the list would keep its default field count until something else
// happened to re-run the effect.
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
