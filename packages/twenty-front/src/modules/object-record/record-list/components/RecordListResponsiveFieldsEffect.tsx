import { recordListDisplayedFieldsComponentState } from '@/object-record/record-list/states/recordListDisplayedFieldsComponentState';
import { computeRecordListDisplayedFields } from '@/object-record/record-list/utils/computeRecordListDisplayedFields';
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
  const setRecordListDisplayedFields = useSetAtomComponentState(
    recordListDisplayedFieldsComponentState,
  );

  useLayoutEffect(() => {
    if (!isDefined(containerElement)) {
      return;
    }

    const updateDisplayedFields = () => {
      setRecordListDisplayedFields(
        computeRecordListDisplayedFields(containerElement.clientWidth),
      );
    };

    updateDisplayedFields();

    const resizeObserver = new ResizeObserver(updateDisplayedFields);

    resizeObserver.observe(containerElement);

    return () => resizeObserver.disconnect();
  }, [containerElement, setRecordListDisplayedFields]);

  return null;
};
