import { useState } from 'react';
import styled from '@emotion/styled';

import NavItemsContainer from './NavItemsContainer';
import NavWorkspaceButton from './NavWorkspaceButton';
import SupportChat from './SupportChat';

type OwnProps = {
  children: React.ReactNode;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2.5)};
  width: 100%;
`;

const MainNavbar = ({ children }: OwnProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <StyledContainer>
      <div onMouseEnter={handleHover} onMouseLeave={handleMouseLeave}>
        <NavWorkspaceButton hideCollapseButton={isHovered} />
        <NavItemsContainer>{children}</NavItemsContainer>
      </div>
      <SupportChat />
    </StyledContainer>
  );
};

export default MainNavbar;
