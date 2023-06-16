import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { Panel } from '../Panel';
import { RightDrawer } from '../right-drawer/components/RightDrawer';

type OwnProps = {
  children: JSX.Element;
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
    100% - ${(props) => props.theme.spacing(2)} -
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

export function NoTopBarContainer({ children }: OwnProps) {
  return (
    <StyledContainer>
      <MainContainer>
        <LeftContainer>
          <Panel>{children}</Panel>
        </LeftContainer>
        <RightDrawer />
      </MainContainer>
    </StyledContainer>
  );
}
