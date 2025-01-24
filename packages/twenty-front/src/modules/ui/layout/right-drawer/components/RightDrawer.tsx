import { isRightDrawerAnimationCompletedState } from '@/ui/layout/right-drawer/states/isRightDrawerAnimationCompletedState';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';

import { RIGHT_DRAWER_ANIMATION_VARIANTS } from '@/ui/layout/right-drawer/constants/RightDrawerAnimationVariants';
import { RightDrawerAnimationVariant } from '@/ui/layout/right-drawer/types/RightDrawerAnimationVariant';
import { RightDrawerRouter } from './RightDrawerRouter';

const StyledContainer = styled(motion.div)<{ isRightDrawerMinimized: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  border-left: ${({ theme, isRightDrawerMinimized }) =>
    isRightDrawerMinimized
      ? `1px solid ${theme.border.color.strong}`
      : `1px solid ${theme.border.color.medium}`};
  border-top: ${({ theme, isRightDrawerMinimized }) =>
    isRightDrawerMinimized ? `1px solid ${theme.border.color.strong}` : 'none'};
  border-top-left-radius: ${({ theme, isRightDrawerMinimized }) =>
    isRightDrawerMinimized ? theme.border.radius.md : '0'};
  box-shadow: ${({ theme, isRightDrawerMinimized }) =>
    isRightDrawerMinimized ? 'none' : theme.boxShadow.light};
  height: 100dvh;
  overflow-x: hidden;
  position: fixed;

  right: 0;
  top: 0;
  z-index: 30;

  .modal-backdrop {
    background: ${({ theme }) => theme.background.overlayTertiary};
  }
`;

const StyledRightDrawer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export const RightDrawer = () => {
  const theme = useTheme();

  const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);

  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);

  const setIsRightDrawerAnimationCompleted = useSetRecoilState(
    isRightDrawerAnimationCompletedState,
  );

  const rightDrawerPage = useRecoilValue(rightDrawerPageState);

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

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  return (
    <StyledContainer
      isRightDrawerMinimized={isRightDrawerMinimized}
      animate={targetVariantForAnimation}
      variants={RIGHT_DRAWER_ANIMATION_VARIANTS}
      transition={{ duration: theme.animation.duration.normal }}
      onAnimationComplete={handleAnimationComplete}
    >
      <StyledRightDrawer>
        {isRightDrawerOpen && <RightDrawerRouter />}
      </StyledRightDrawer>
    </StyledContainer>
  );
};
