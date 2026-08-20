import { useEffect } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { persistedUiScaleStepState } from '@/ui/theme/states/persistedUiScaleStepState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

// BaseThemeProvider renders from the persisted step so the scale is right
// before login resolves; this keeps the persisted copy following the
// workspace member, which is the synced source of truth.
export const UserUiScaleProviderEffect = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setPersistedUiScaleStep = useSetAtomState(persistedUiScaleStepState);

  useEffect(() => {
    if (isDefined(currentWorkspaceMember?.uiScale)) {
      setPersistedUiScaleStep(currentWorkspaceMember.uiScale);
    }
  }, [currentWorkspaceMember?.uiScale, setPersistedUiScaleStep]);

  return <></>;
};
