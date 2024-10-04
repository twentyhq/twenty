import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useBottomBarStates } from '@/ui/layout/bottom-bar/hooks/internal/useBottomBarStates';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useBottomBarInternalHotkeyScopeManagement = ({
  bottomBarScopeId,
  bottomBarHotkeyScopeFromParent,
}: {
  bottomBarScopeId: string;
  bottomBarHotkeyScopeFromParent?: HotkeyScope;
}) => {
  const { bottomBarHotkeyScopeState } = useBottomBarStates({
    bottomBarScopeId,
  });

  const [bottomBarHotkeyScope, setBottomBarHotkeyScope] = useRecoilState(
    bottomBarHotkeyScopeState,
  );

  useEffect(() => {
    if (!isDeeplyEqual(bottomBarHotkeyScopeFromParent, bottomBarHotkeyScope)) {
      setBottomBarHotkeyScope(bottomBarHotkeyScopeFromParent);
    }
  }, [
    bottomBarHotkeyScope,
    bottomBarHotkeyScopeFromParent,
    setBottomBarHotkeyScope,
  ]);
};
