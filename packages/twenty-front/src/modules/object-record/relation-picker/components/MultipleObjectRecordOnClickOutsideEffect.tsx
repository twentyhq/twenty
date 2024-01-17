import { useListenClickOutsideV2 } from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';

export const MultipleObjectRecordOnClickOutsideEffect = ({
  containerRef,
  onClickOutside,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  onClickOutside: () => void;
}) => {
  useListenClickOutsideV2({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      onClickOutside();
    },
    listenerId: 'multiple-object-record',
    isLocking: true,
  });

  return <></>;
};
