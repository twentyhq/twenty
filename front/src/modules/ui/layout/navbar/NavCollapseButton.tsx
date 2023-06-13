import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconSidebarLeftCollapse, IconSidebarRightCollapse } from '@/ui/icons';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';
import { MOBILE_VIEWPORT } from '../styles/themes';

const CollapseButton = styled.button<{ hideOnDesktop: boolean | undefined }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  user-select: none;
  border: 0;
  background: inherit;

  padding: 0;
  cursor: pointer;

  color: ${(props) => props.theme.text30};

  ${(props) =>
    props.hideOnDesktop &&
    `@media (min-width: ${MOBILE_VIEWPORT}px) {
        display:none;
    }
    `}
`;

interface CollapseButtonProps {
  hideIfOpen?: boolean;
  hideIfClosed?: boolean;
  hideOnDesktop?: boolean;
}

export default function NavCollapseButton({
  hideIfOpen,
  hideOnDesktop,
}: CollapseButtonProps) {
  const [isNavOpen, setIsNavOpen] = useRecoilState(isNavbarOpenedState);

  return (
    <>
      {isNavOpen && !hideIfOpen && (
        <CollapseButton
          onClick={() => setIsNavOpen(!isNavOpen)}
          hideOnDesktop={hideOnDesktop}
        >
          <IconSidebarLeftCollapse size={16} />
        </CollapseButton>
      )}
      {!isNavOpen && (
        <CollapseButton
          onClick={() => setIsNavOpen(!isNavOpen)}
          hideOnDesktop={hideOnDesktop}
        >
          <IconSidebarRightCollapse size={16} />
        </CollapseButton>
      )}
    </>
  );
}
