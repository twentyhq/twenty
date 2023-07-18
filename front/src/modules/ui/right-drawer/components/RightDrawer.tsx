import { useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import {
  ClickOutsideMode,
  useListenClickOutsideArrayOfRef,
} from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { isDefined } from '~/utils/isDefined';

import { useScopedHotkeys } from '../../hotkey/hooks/useScopedHotkeys';
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

  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  const rightDrawerRef = useRef(null);
  useListenClickOutsideArrayOfRef({
    refs: [rightDrawerRef],
    callback: () => setIsRightDrawerOpen(false),
    mode: ClickOutsideMode.absolute,
  });
  const theme = useTheme();

  useScopedHotkeys(
    [Key.Escape],
    () => setIsRightDrawerOpen(false),
    RightDrawerHotkeyScope.RightDrawer,
    [setIsRightDrawerOpen],
  );

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  return (
    <StyledContainer
      animate={{
        width: isRightDrawerOpen ? theme.rightDrawerWidth : '0',
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
