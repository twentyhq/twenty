import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconSidebarLeftCollapse } from '@/ui/icons';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

const CollapseButton = styled.button`
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
`;

export default function NavCollapseButton() {
  const [isNavOpen, setIsNavOpen] = useRecoilState(isNavbarOpenedState);

  return (
    <>
      {isNavOpen && (
        <CollapseButton onClick={() => setIsNavOpen(!isNavOpen)}>
          <IconSidebarLeftCollapse size={16} />
        </CollapseButton>
      )}
    </>
  );
}
