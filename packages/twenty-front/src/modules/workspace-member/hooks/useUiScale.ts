import { useCallback } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateWorkspaceMemberSettings } from '@/workspace-member/hooks/useUpdateWorkspaceMemberSettings';
import { persistedUiScaleStepState } from '@/ui/theme/states/persistedUiScaleStepState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isDefined } from 'twenty-shared/utils';
import { type UiScale } from '@/ui/theme/types/UiScale';

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
