import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from '@/ui/icon';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { navbarIconSize } from '../constants';

const CollapseButton = styled.button`
  align-items: center;
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
  width: 32px;
`;

type CollapseButtonProps = {
  direction?: 'left' | 'right';
};

export default function NavCollapseButton({
  direction = 'left',
}: CollapseButtonProps) {
  const [isNavOpen, setIsNavOpen] = useRecoilState(isNavbarOpenedState);

  const iconSize = useIsMobile()
    ? navbarIconSize.mobile
    : navbarIconSize.desktop;

  return (
    <>
      {direction === 'left' ? (
        <CollapseButton onClick={() => setIsNavOpen(!isNavOpen)}>
          <IconLayoutSidebarLeftCollapse size={iconSize} />
        </CollapseButton>
      ) : (
        <CollapseButton onClick={() => setIsNavOpen(!isNavOpen)}>
          <IconLayoutSidebarRightCollapse size={iconSize} />
        </CollapseButton>
      )}
    </>
  );
}
