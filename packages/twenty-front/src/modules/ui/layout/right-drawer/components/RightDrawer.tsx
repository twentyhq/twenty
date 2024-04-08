import { useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { rightDrawerCloseEventState } from '@/ui/layout/right-drawer/states/rightDrawerCloseEventsState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { ClickOutsideMode } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from '~/utils/isDefined';

import { useRightDrawer } from '../hooks/useRightDrawer';
import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerHotkeyScope } from '../types/RightDrawerHotkeyScope';

import { RightDrawerRouter } from './RightDrawerRouter';

const StyledContainer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  height: 100%;
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
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useRecoilState(
    isRightDrawerOpenState,
  );

  const isRightDrawerExpanded = useRecoilValue(isRightDrawerExpandedState);

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

          if (isRightDrawerOpen) {
            set(rightDrawerCloseEventState, event);
            closeRightDrawer();
          }
        },
      [closeRightDrawer],
    ),
    mode: ClickOutsideMode.comparePixels,
  });

  const theme = useTheme();

  useScopedHotkeys(
    [Key.Escape],

    () => {
      closeRightDrawer();
    },
    RightDrawerHotkeyScope.RightDrawer,
    [setIsRightDrawerOpen],
  );

  const isMobile = useIsMobile();

  const rightDrawerWidth = isRightDrawerOpen
    ? isMobile || isRightDrawerExpanded
      ? '100%'
      : theme.rightDrawerWidth
    : '0';

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  const variants = {
    fullScreen: {
      x: '0%',
    },
    normal: {
      x: '0%',
      width: rightDrawerWidth,
    },
    closed: {
      x: '100%',
    },
  };

  return (
    <StyledContainer
      initial="closed"
      animate={isRightDrawerOpen ? 'normal' : 'closed'}
      variants={variants}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      <StyledRightDrawer ref={rightDrawerRef}>
        {isRightDrawerOpen && <RightDrawerRouter />}
      </StyledRightDrawer>
    </StyledContainer>
  );
};
