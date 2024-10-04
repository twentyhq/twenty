import styled from '@emotion/styled';

import { useBottomBarStates } from '@/ui/layout/bottom-bar/hooks/internal/useBottomBarStates';
import { useBottomBarInternalHotkeyScopeManagement } from '@/ui/layout/bottom-bar/hooks/useBottomBarInternalHotkeyScopeManagement';
import { BottomBarScope } from '@/ui/layout/bottom-bar/scopes/BottomBarScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { useRecoilValue } from 'recoil';

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

type BottomBarProps = {
  bottomBarId: string;
  bottomBarHotkeyScopeFromParent: HotkeyScope;
  children: React.ReactNode;
};

export const BottomBar = ({
  bottomBarId,
  bottomBarHotkeyScopeFromParent,
  children,
}: BottomBarProps) => {
  const scopeId = getScopeIdFromComponentId(bottomBarId);
  const { isBottomBarOpenState } = useBottomBarStates({
    bottomBarScopeId: scopeId,
  });
  const isBottomBarOpen = useRecoilValue(isBottomBarOpenState);
  useBottomBarInternalHotkeyScopeManagement({
    bottomBarScopeId: scopeId,
    bottomBarHotkeyScopeFromParent,
  });

  if (!isBottomBarOpen) {
    return null;
  }

  return (
    <BottomBarScope bottomBarScopeId={scopeId}>
      <StyledContainerActionBar data-select-disable className="bottom-bar">
        {children}
      </StyledContainerActionBar>
    </BottomBarScope>
  );
};
