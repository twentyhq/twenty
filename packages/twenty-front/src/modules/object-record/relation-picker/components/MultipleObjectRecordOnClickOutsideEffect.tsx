import { useEffect } from 'react';

import { MULTI_OBJECT_RECORD_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordClickOutsideListenerId';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useListenClickOutsideV2 } from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';

export const MultipleObjectRecordOnClickOutsideEffect = ({
  containerRef,
  onClickOutside,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  onClickOutside: () => void;
}) => {
  const { toggleClickOutsideListener: toggleRightDrawerClickOustideListener } =
    useClickOutsideListener(RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID);

  useEffect(() => {
    toggleRightDrawerClickOustideListener(false);

    return () => {
      toggleRightDrawerClickOustideListener(true);
    };
  }, [toggleRightDrawerClickOustideListener]);

  useListenClickOutsideV2({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      onClickOutside();
    },
    listenerId: MULTI_OBJECT_RECORD_CLICK_OUTSIDE_LISTENER_ID,
  });

  return <></>;
};
