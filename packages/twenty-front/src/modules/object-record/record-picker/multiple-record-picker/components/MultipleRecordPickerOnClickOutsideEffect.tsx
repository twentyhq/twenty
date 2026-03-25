import { MULTIPLE_RECORD_PICKER_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-picker/multiple-record-picker/constants/MultipleRecordPickerClickOutsideListenerId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

export const MultipleRecordPickerOnClickOutsideEffect = ({
  containerRef,
  onClickOutside,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  onClickOutside: () => void;
}) => {
  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      onClickOutside();
    },
    listenerId: MULTIPLE_RECORD_PICKER_CLICK_OUTSIDE_LISTENER_ID,
  });

  return <></>;
};
