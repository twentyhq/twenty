import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from '@/ui/icon';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { MOBILE_VIEWPORT } from '@/ui/themes/themes';

import { useIsMobile } from '../../../../hooks/useIsMobile';

const CollapseButton = styled.button<{ hideOnDesktop: boolean | undefined }>`
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

  ${(props) =>
    props.hideOnDesktop &&
    `@media (min-width: ${MOBILE_VIEWPORT}px) {
        display:none;
    }
    `}
`;

type CollapseButtonProps = {
  hideIfOpen?: boolean;
  hideIfClosed?: boolean;
  hideOnDesktop?: boolean;
};

export default function NavCollapseButton({
  hideIfOpen,
  hideOnDesktop,
}: CollapseButtonProps) {
  const [isNavOpen, setIsNavOpen] = useRecoilState(isNavbarOpenedState);

  const showOpen = !isNavOpen && !hideIfOpen;

  return (
    <>
      {showOpen ? (
        <CollapseButton
          onClick={() => setIsNavOpen(!isNavOpen)}
          hideOnDesktop={hideOnDesktop}
        >
          <IconLayoutSidebarLeftCollapse size={16} />
        </CollapseButton>
      ) : (
        <CollapseButton
          onClick={() => setIsNavOpen(!isNavOpen)}
          hideOnDesktop={hideOnDesktop}
        >
          <IconLayoutSidebarRightCollapse size={16} />
        </CollapseButton>
      )}
    </>
  );
}
