import styled from '@emotion/styled';

import { NavbarContainer } from './navbar/NavbarContainer';
import { MOBILE_VIEWPORT } from './styles/themes';

type OwnProps = {
  children: JSX.Element;
  Navbar: () => JSX.Element;
};

const StyledLayout = styled.div`
  background: ${(props) => props.theme.noisyBackground};
  display: flex;
  flex-direction: row;
  height: 100vh;
  position: relative;
  width: 100vw;
`;
const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  width: 100%;
`;

const SubContainer = styled.div`
  background: ${(props) => props.theme.primaryBackground};
  border: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: ${(props) => props.theme.spacing(2)};
  display: flex;
  flex-direction: column;
  margin: ${(props) => props.theme.spacing(4)};
  max-width: calc(100vw - 500px);
  padding: ${(props) => props.theme.spacing(8)};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    max-width: none;
  }
`;

const SubSubContainer = styled.div`
  color: ${(props) => props.theme.text100};
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export const SecondaryLayout = ({ children, Navbar }: OwnProps) => {
  return (
    <StyledLayout>
      <NavbarContainer layout="secondary">
        <Navbar />
      </NavbarContainer>
      <MainContainer>
        <SubContainer>
          <SubSubContainer>{children}</SubSubContainer>
        </SubContainer>
      </MainContainer>
    </StyledLayout>
  );
};
