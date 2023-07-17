import { useRef } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';

import {
  OutsideClickAlerterMode,
  useOutsideAlerter,
} from '@/ui/hooks/useOutsideAlerter';
import { isDefined } from '~/utils/isDefined';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';

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
  useOutsideAlerter({
    ref: rightDrawerRef,
    callback: () => setIsRightDrawerOpen(false),
    mode: OutsideClickAlerterMode.absolute,
  });
  const theme = useTheme();
  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  console.log(isRightDrawerOpen);

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
