import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from '@/ui/icon';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { navbarIconSize } from '../constants';

const StyledCollapseButton = styled.button<{
  isHovered: boolean;
}>`
  align-items: center;
  animation: ${({ isHovered }) => (isHovered ? 'fadeIn 150ms' : 'none')};
  background: inherit;
  border: 0;
  &:hover {
    background: ${({ theme }) => theme.background.quaternary};
  }
  border-radius: ${({ theme }) => theme.border.radius.md};

  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;

  display: flex;
  height: 32px;
  justify-content: center;

  padding: 0;

  user-select: none;
  visibility: ${({ isHovered }) => (isHovered ? 'visible' : 'hidden')};
  width: 32px;

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

type CollapseButtonProps = {
  direction?: 'left' | 'right';
  isVisible: boolean;
};

export default function NavCollapseButton({
  direction = 'left',
  isHovered,
}: CollapseButtonProps) {
  const [isNavOpen, setIsNavOpen] = useRecoilState(isNavbarOpenedState);

  const iconSize = useIsMobile()
    ? navbarIconSize.mobile
    : navbarIconSize.desktop;

  return (
    <>
      {direction === 'left' ? (
        <StyledCollapseButton
          isHovered={isHovered}
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <IconLayoutSidebarLeftCollapse size={iconSize} />
        </StyledCollapseButton>
      ) : (
        <StyledCollapseButton
          isHovered={isHovered}
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <IconLayoutSidebarRightCollapse size={iconSize} />
        </StyledCollapseButton>
      )}
    </>
  );
}
