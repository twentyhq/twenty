import styled from '@emotion/styled';

import { NavbarContainer } from './navbar/NavbarContainer';
import { MOBILE_VIEWPORT } from './styles/themes';

type OwnProps = {
  children: JSX.Element;
  navbar: JSX.Element;
};

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  background: ${(props) => props.theme.noisyBackground};
  position: relative;
`;
const MainContainer = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.primaryBackground};
  border-radius: ${(props) => props.theme.spacing(2)};
  border: 1px solid ${(props) => props.theme.primaryBorder};
  padding: ${(props) => props.theme.spacing(2)};
  margin: ${(props) => props.theme.spacing(4)};
  width: 100%;
  max-width: calc(100vw - 500px);
  padding: 32px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    max-width: none;
  }
`;

const SubSubContainer = styled.div`
  display: flex;
  width: 350px;
  flex-direction: column;
  gap: 32px;
  color: ${(props) => props.theme.text100};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export const SecondaryLayout = ({ children, navbar }: OwnProps) => {
  return (
    <StyledLayout>
      <NavbarContainer width="500px">{navbar}</NavbarContainer>
      <MainContainer>
        <SubContainer>
          <SubSubContainer>{children}</SubSubContainer>
        </SubContainer>
      </MainContainer>
    </StyledLayout>
  );
};
