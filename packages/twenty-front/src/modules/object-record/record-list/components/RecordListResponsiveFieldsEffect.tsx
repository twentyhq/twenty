import { recordListRowWidthComponentState } from '@/object-record/record-list/states/recordListRowWidthComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordListResponsiveFieldsEffectProps = {
  containerElement: HTMLElement | null;
};

// Takes the element, not a ref: a parent's ref is still null in its children's layout effects on mount.
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

    // Measure the content box: clientWidth includes padding the rows never get.
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
