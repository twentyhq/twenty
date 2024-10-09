import { useEffect } from 'react';

import { bottomBarHotkeyComponentState } from '@/ui/layout/bottom-bar/states/bottomBarHotkeyComponentState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useBottomBarInternalHotkeyScopeManagement = ({
  bottomBarId,
  bottomBarHotkeyScopeFromParent,
}: {
  bottomBarId?: string;
  bottomBarHotkeyScopeFromParent?: HotkeyScope;
}) => {
  const [bottomBarHotkeyScope, setBottomBarHotkeyScope] =
    useRecoilComponentStateV2(bottomBarHotkeyComponentState, bottomBarId);

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
