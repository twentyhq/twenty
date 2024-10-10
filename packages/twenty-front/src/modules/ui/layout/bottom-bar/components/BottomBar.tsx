import styled from '@emotion/styled';

import { useBottomBarInternalHotkeyScopeManagement } from '@/ui/layout/bottom-bar/hooks/useBottomBarInternalHotkeyScopeManagement';
import { BottomBarInstanceContext } from '@/ui/layout/bottom-bar/states/contexts/BottomBarInstanceContext';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

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
  const isBottomBarOpen = useRecoilComponentValueV2(
    isBottomBarOpenedComponentState,
    bottomBarId,
  );

  useBottomBarInternalHotkeyScopeManagement({
    bottomBarId,
    bottomBarHotkeyScopeFromParent,
  });

  if (!isBottomBarOpen) {
    return null;
  }

  return (
    <BottomBarInstanceContext.Provider value={{ instanceId: bottomBarId }}>
      <StyledContainerActionBar data-select-disable className="bottom-bar">
        {children}
      </StyledContainerActionBar>
    </BottomBarInstanceContext.Provider>
  );
};
