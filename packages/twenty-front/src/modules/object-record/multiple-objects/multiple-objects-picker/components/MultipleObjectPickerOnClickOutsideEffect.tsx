import { RECORD_PICKER_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-picker/constants/RecordPickerClickOutsideListenerId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

export const MultipleObjectPickerOnClickOutsideEffect = ({
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
    listenerId: RECORD_PICKER_CLICK_OUTSIDE_LISTENER_ID,
  });

  return <></>;
};
