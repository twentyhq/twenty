import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { isDefined } from '@/utils/type-guards/isDefined';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';

import { RightDrawerRouter } from './RightDrawerRouter';

const ClickableBackground = styled.div`
  //backdrop-filter: blur(1px);
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1;
`;

const StyledContainer = styled.div`
  background: white;
  box-shadow: ${({ theme }) => theme.boxShadow.rightDrawer};
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

  if (!isRightDrawerOpen || !isDefined(rightDrawerPage)) {
    return <></>;
  }

  return (
    <>
      <ClickableBackground onClick={() => setIsRightDrawerOpen(false)} />
      <StyledContainer>
        <StyledRightDrawer>
          <RightDrawerRouter />
        </StyledRightDrawer>
      </StyledContainer>
    </>
  );
}
