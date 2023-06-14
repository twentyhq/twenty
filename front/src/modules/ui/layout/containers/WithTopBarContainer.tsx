import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { Panel } from '../Panel';
import { RightDrawer } from '../right-drawer/components/RightDrawer';
import { isRightDrawerOpenState } from '../right-drawer/states/isRightDrawerOpenState';
import { TOP_BAR_MIN_HEIGHT, TopBar } from '../top-bar/TopBar';

type OwnProps = {
  children: JSX.Element;
  title: string;
  icon: ReactNode;
  onAddButtonClick?: () => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const MainContainer = styled.div`
  background: ${(props) => props.theme.noisyBackground};
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.theme.spacing(2)};
  height: calc(
    100% - ${TOP_BAR_MIN_HEIGHT} - ${(props) => props.theme.spacing(2)} -
      ${(props) => props.theme.spacing(5)}
  );
  padding-bottom: ${(props) => props.theme.spacing(3)};
  padding-right: ${(props) => props.theme.spacing(3)};
  width: calc(100% - ${(props) => props.theme.spacing(3)});
`;

type LeftContainerProps = {
  isRightDrawerOpen?: boolean;
};

const LeftContainer = styled.div<LeftContainerProps>`
  display: flex;
  position: relative;
  width: calc(
    100% -
      ${(props) =>
        props.isRightDrawerOpen
          ? `${props.theme.rightDrawerWidth} - ${props.theme.spacing(2)}`
          : '0px'}
  );
`;

export function WithTopBarContainer({
  children,
  title,
  icon,
  onAddButtonClick,
}: OwnProps) {
  const [isRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  return (
    <StyledContainer>
      <TopBar title={title} icon={icon} onAddButtonClick={onAddButtonClick} />
      <MainContainer>
        <LeftContainer isRightDrawerOpen={isRightDrawerOpen}>
          <Panel>{children}</Panel>
        </LeftContainer>
        <RightDrawer />
      </MainContainer>
    </StyledContainer>
  );
}
