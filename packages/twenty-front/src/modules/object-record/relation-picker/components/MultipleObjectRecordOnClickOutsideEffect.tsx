import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

export const MultipleObjectRecordOnClickOutsideEffect = ({
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
  });

  return <></>;
};
