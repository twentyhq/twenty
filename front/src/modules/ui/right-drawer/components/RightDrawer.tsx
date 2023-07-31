import { useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/click-outside/hooks/useListenClickOutside';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from '~/utils/isDefined';

import { leftNavbarWidth } from '../../navbar/constants';
import { useRightDrawer } from '../hooks/useRightDrawer';
import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerHotkeyScope } from '../types/RightDrawerHotkeyScope';

import { RightDrawerRouter } from './RightDrawerRouter';

const StyledContainer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  height: 100%;
  overflow-x: hidden;
  position: fixed;

  right: 0;
  top: 0;
  z-index: 2;
`;

const StyledRightDrawer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export function RightDrawer() {
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useRecoilState(
    isRightDrawerOpenState,
  );

  const [isRightDrawerExpanded] = useRecoilState(isRightDrawerExpandedState);

  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  const { closeRightDrawer } = useRightDrawer();

  const rightDrawerRef = useRef(null);

  useListenClickOutside({
    refs: [rightDrawerRef],
    callback: () => closeRightDrawer(),
    mode: ClickOutsideMode.absolute,
  });

  const theme = useTheme();

  useScopedHotkeys(
    [Key.Escape],
    () => closeRightDrawer(),
    RightDrawerHotkeyScope.RightDrawer,
    [setIsRightDrawerOpen],
  );

  const isMobile = useIsMobile();

  const rightDrawerWidthExpanded = `calc(100% - ${
    leftNavbarWidth.desktop
  } - ${theme.spacing(2)})`;

  const rightDrawerWidth = isRightDrawerOpen
    ? isMobile
      ? '100%'
      : isRightDrawerExpanded
      ? rightDrawerWidthExpanded
      : theme.rightDrawerWidth
    : '0';

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  return (
    <StyledContainer
      animate={{
        width: rightDrawerWidth,
      }}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      <StyledRightDrawer ref={rightDrawerRef}>
        {isRightDrawerOpen && <RightDrawerRouter />}
      </StyledRightDrawer>
    </StyledContainer>
  );
}
