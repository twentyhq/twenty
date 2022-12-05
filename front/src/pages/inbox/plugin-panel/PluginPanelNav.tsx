import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-regular-svg-icons';

const StyledNav = styled.div`
  display: flex;
  flex-direction: column;
  width: 60px;
  border-left: 1px solid #eaecee;
  background: #f1f3f5;
`;

const StyledNavItem = styled.div`
  display: flex;
  width: 60px;
  border-bottom: 1px solid #eaecee;
  padding: 22px;
  cursor: pointer;
`;

function PluginPanelNav() {
  return (
    <StyledNav>
      <StyledNavItem>
        <FontAwesomeIcon icon={faClone} size="lg" />
      </StyledNavItem>
      <StyledNavItem>
        <FontAwesomeIcon icon={faClone} size="lg" />
      </StyledNavItem>
      <StyledNavItem>
        <FontAwesomeIcon icon={faClone} size="lg" />
      </StyledNavItem>
      <StyledNavItem>
        <FontAwesomeIcon icon={faClone} size="lg" />
      </StyledNavItem>
      <StyledNavItem>
        <FontAwesomeIcon icon={faClone} size="lg" />
      </StyledNavItem>
      <StyledNavItem>
        <FontAwesomeIcon icon={faClone} size="lg" />
      </StyledNavItem>
    </StyledNav>
  );
}

export default PluginPanelNav;
