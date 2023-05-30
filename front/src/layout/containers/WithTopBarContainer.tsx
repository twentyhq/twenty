import styled from '@emotion/styled';
import TopBar from '../top-bar/TopBar';
import { ReactNode } from 'react';
import { RightDrawer } from '../right-drawer/RightDrawer';
import { Panel } from '../Panel';
import { isRightDrawerOpenState } from '../../modules/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { useRecoilState } from 'recoil';

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
  display: flex;
  flex-direction: row;
  height: 100%;
  width: calc(100% - 16px);
  margin-right: 8px;
  margin-bottom: 8px;
  gap: 8px;
  padding: 4px;
`;

const RIGHT_DRAWER_WIDTH = '300px';

type LeftContainerProps = {
  isRightDrawerOpen?: boolean;
};

const LeftContainer = styled.div<LeftContainerProps>`
  display: flex;
  width: calc(
    100% - ${(props) => (props.isRightDrawerOpen ? RIGHT_DRAWER_WIDTH : '0px')}
  );
`;

function FullWidthContainer({
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

export default FullWidthContainer;
