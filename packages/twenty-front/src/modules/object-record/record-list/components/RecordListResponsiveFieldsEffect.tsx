import { recordListRowWidthComponentState } from '@/object-record/record-list/states/recordListRowWidthComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordListResponsiveFieldsEffectProps = {
  containerElement: HTMLElement | null;
};

// Takes the element rather than a ref object. React attaches a host element's
// ref only after the layout effects of its children have run, so reading the
// parent's ref here on mount finds null and nothing re-runs the effect once it
// is filled — the list would keep its default field count. A callback ref
// stored in state re-renders instead, and the effect measures the real element.
export const RecordListResponsiveFieldsEffect = ({
  containerElement,
}: RecordListResponsiveFieldsEffectProps) => {
  const setRecordListRowWidth = useSetAtomComponentState(
    recordListRowWidthComponentState,
  );

  useLayoutEffect(() => {
    if (!isDefined(containerElement)) {
      return;
    }

    // clientWidth counts the container's own padding, which the rows never get
    // to use. Measuring the content box keeps the field widths handed to the
    // rows equal to the space they actually render in.
    const updateDisplayedFields = () => {
      const { paddingLeft, paddingRight } = getComputedStyle(containerElement);

      setRecordListRowWidth(
        containerElement.clientWidth -
          parseFloat(paddingLeft) -
          parseFloat(paddingRight),
      );
    };

    updateDisplayedFields();

    const resizeObserver = new ResizeObserver(updateDisplayedFields);

    resizeObserver.observe(containerElement);

    return () => resizeObserver.disconnect();
  }, [containerElement, setRecordListRowWidth]);

  return null;
};
