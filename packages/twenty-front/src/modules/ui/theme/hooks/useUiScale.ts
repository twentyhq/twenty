import { useCallback } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { persistedUiScaleStepState } from '@/ui/theme/states/persistedUiScaleStepState';
import { type UiScale } from '@/workspace-member/types/WorkspaceMember';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isDefined } from 'twenty-shared/utils';

export const useUiScale = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );
  const [persistedUiScaleStep, setPersistedUiScaleStep] = useAtomState(
    persistedUiScaleStepState,
  );

  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  const uiScaleStep =
    currentWorkspaceMember?.uiScale ?? persistedUiScaleStep ?? 'Default';

  const setUiScaleStep = useCallback(
    async (step: UiScale) => {
      if (!isDefined(currentWorkspaceMember)) {
        return;
      }

      setPersistedUiScaleStep(step);
      setCurrentWorkspaceMember((current) => {
        if (!isDefined(current)) {
          return current;
        }
        return {
          ...current,
          uiScale: step,
        };
      });
      await updateWorkspaceMemberSettings({
        workspaceMemberId: currentWorkspaceMember.id,
        update: {
          uiScale: step,
        },
      });
    },
    [
      currentWorkspaceMember,
      setCurrentWorkspaceMember,
      setPersistedUiScaleStep,
      updateWorkspaceMemberSettings,
    ],
  );

  return { uiScaleStep, setUiScaleStep };
};
