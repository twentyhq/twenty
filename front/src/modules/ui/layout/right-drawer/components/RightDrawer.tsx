import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useOutsideAlerter } from '@/ui/hooks/useOutsideAlerter';
import { isDefined } from '@/utils/type-guards/isDefined';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';

import { RightDrawerRouter } from './RightDrawerRouter';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  height: 100%;
  overflow-x: hidden;
  position: fixed;
  right: 0;
  top: 0;
  transition: width 0.5s;
  width: ${({ theme }) => theme.rightDrawerWidth};
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
  useOutsideAlerter(rightDrawerRef, () => setIsRightDrawerOpen(false));
  if (!isRightDrawerOpen || !isDefined(rightDrawerPage)) {
    return <></>;
  }

  return (
    <>
      <StyledContainer>
        <StyledRightDrawer ref={rightDrawerRef}>
          <RightDrawerRouter />
        </StyledRightDrawer>
      </StyledContainer>
    </>
  );
}
