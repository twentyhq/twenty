import styled from '@emotion/styled';

import { BottomBarScope } from '@/ui/layout/bottom-bar/scopes/BottomBarScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

const StyledContainerActionBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  bottom: 38px;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  height: 48px;
  width: max-content;
  left: 50%;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: auto;

  transform: translateX(-50%);
  z-index: 1;
`;

export const BottomBar = ({
  bottomBarId,
  children,
}: {
  bottomBarId: string;
  children: React.ReactNode;
}) => {
  return (
    <BottomBarScope bottomBarScopeId={getScopeIdFromComponentId(bottomBarId)}>
      <StyledContainerActionBar data-select-disable className="bottom-bar">
        {children}
      </StyledContainerActionBar>
    </BottomBarScope>
  );
};
