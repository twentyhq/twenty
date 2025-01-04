import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { rightDrawerCloseEventState } from '@/ui/layout/right-drawer/states/rightDrawerCloseEventsState';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { workflowReactFlowRefState } from '@/workflow/workflow-diagram/states/workflowReactFlowRefState';
import styled from '@emotion/styled';
import { useRef } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

const StyledRightDrawerPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

export const RightDrawerContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const rightDrawerRef = useRef<HTMLDivElement>(null);

  const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);

  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);

  const { closeRightDrawer } = useRightDrawer();

  const workflowReactFlowRef = useRecoilValue(workflowReactFlowRefState);

  useListenClickOutside({
    refs: [
      rightDrawerRef,
      ...(workflowReactFlowRef ? [workflowReactFlowRef] : []),
    ],
    listenerId: RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
    callback: useRecoilCallback(
      ({ snapshot, set }) =>
        (event) => {
          const isRightDrawerOpen = snapshot
            .getLoadable(isRightDrawerOpenState)
            .getValue();
          const isRightDrawerMinimized = snapshot
            .getLoadable(isRightDrawerMinimizedState)
            .getValue();

          if (isRightDrawerOpen && !isRightDrawerMinimized) {
            set(rightDrawerCloseEventState, event);

            closeRightDrawer();
          }
        },
      [closeRightDrawer],
    ),
    mode: ClickOutsideMode.comparePixels,
  });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      if (isRightDrawerOpen && !isRightDrawerMinimized) {
        closeRightDrawer();
      }
    },
    RightDrawerHotkeyScope.RightDrawer,
    [isRightDrawerOpen, isRightDrawerMinimized],
  );

  return (
    <StyledRightDrawerPage ref={rightDrawerRef}>
      {children}
    </StyledRightDrawerPage>
  );
};
