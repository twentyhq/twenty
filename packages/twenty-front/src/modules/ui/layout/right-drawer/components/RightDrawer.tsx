import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { Key } from 'ts-key-enum';

import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { isRightDrawerAnimationCompletedState } from '@/ui/layout/right-drawer/states/isRightDrawerAnimationCompletedState';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { rightDrawerCloseEventState } from '@/ui/layout/right-drawer/states/rightDrawerCloseEventsState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { ClickOutsideMode } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { useRightDrawer } from '../hooks/useRightDrawer';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerHotkeyScope } from '../types/RightDrawerHotkeyScope';

import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { RightDrawerRouter } from './RightDrawerRouter';

const StyledContainer = styled(motion.div)<{ isTabClosed: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  border-top-left-radius: ${({ theme, isTabClosed }) =>
    isTabClosed ? theme.border.radius.md : '0'};
  border-left: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-top: ${({ theme, isTabClosed }) =>
    isTabClosed ? `1px solid ${theme.border.color.medium}` : 'none'};
  box-shadow: ${({ theme, isTabClosed }) =>
    isTabClosed ? theme.boxShadow.light : 'none'};
  height: 100dvh;
  overflow-x: hidden;
  position: fixed;

  right: 0;
  top: 0;
  z-index: 100;
`;

const StyledRightDrawer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export const RightDrawer = () => {
  const theme = useTheme();

  const animationVariants = {
    fullScreen: {
      x: '0%',
      width: '100%',
      height: '100%',
      bottom: '0',
      top: '0',
    },
    normal: {
      x: '0%',
      width: theme.rightDrawerWidth,
      height: '100%',
      bottom: '0',
      top: '0',
    },
    closed: {
      x: '100%',
      width: '0',
      height: '100%',
      bottom: '0',
      top: 'auto',
    },
    minimized: {
      x: '0%',
      width: 220,
      height: 41,
      bottom: '0',
      top: 'auto',
    },
  };

  type RightDrawerAnimationVariant = keyof typeof animationVariants;

  const [isRightDrawerOpen, setIsRightDrawerOpen] = useRecoilState(
    isRightDrawerOpenState,
  );

  const [isTabClosed, setIsTabClosed] = useState(false);

  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);

  const setIsRightDrawerAnimationCompleted = useSetRecoilState(
    isRightDrawerAnimationCompletedState,
  );

  const rightDrawerPage = useRecoilValue(rightDrawerPageState);

  const { closeRightDrawer } = useRightDrawer();

  const rightDrawerRef = useRef<HTMLDivElement>(null);

  const { useListenClickOutside } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

  useListenClickOutside({
    refs: [rightDrawerRef],
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

            emitRightDrawerCloseEvent();
          }
        },
      [closeRightDrawer],
    ),
    mode: ClickOutsideMode.comparePixels,
  });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeRightDrawer();
    },
    RightDrawerHotkeyScope.RightDrawer,
    [setIsRightDrawerOpen],
  );

  const isMobile = useIsMobile();

  const targetVariantForAnimation: RightDrawerAnimationVariant =
    !isRightDrawerOpen
      ? 'closed'
      : isRightDrawerMinimized
        ? 'minimized'
        : isMobile
          ? 'fullScreen'
          : 'normal';

  const handleAnimationComplete = () => {
    setIsRightDrawerAnimationCompleted(isRightDrawerOpen);
  };

  useEffect(() => {
    setIsTabClosed(isRightDrawerMinimized);
  }, [isRightDrawerMinimized]);

  if (!rightDrawerPage) {
    return null;
  }

  return (
    <StyledContainer
      isTabClosed={isTabClosed}
      animate={targetVariantForAnimation}
      variants={animationVariants}
      transition={{
        duration: theme.animation.duration.normal,
      }}
      onAnimationComplete={handleAnimationComplete}
    >
      <StyledRightDrawer ref={rightDrawerRef}>
        {isRightDrawerOpen && <RightDrawerRouter />}
      </StyledRightDrawer>
    </StyledContainer>
  );
};
