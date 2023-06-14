import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from '@/ui/icons';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';
import { MOBILE_VIEWPORT } from '../styles/themes';

const CollapseButton = styled.button<{ hideOnDesktop: boolean | undefined }>`
  align-items: center;
  background: inherit;
  border: 0;

  color: ${(props) => props.theme.text30};
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
          <IconLayoutSidebarLeftCollapse size={16} />
        </CollapseButton>
      )}
      {!isNavOpen && (
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
