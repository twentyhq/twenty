import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/workflow-steps/states/workflowCreateStepFromParentStepIdState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { IconSettingsAutomation } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useStartNodeCreation = () => {
  const { openRightDrawer } = useRightDrawer();
  const setWorkflowCreateStepFromParentStepId = useSetRecoilState(
    workflowCreateStepFromParentStepIdState,
  );
  const setHotkeyScope = useSetHotkeyScope();
  const { openWorkflowActionInCommandMenu } = useCommandMenu();

  const workflowId = useRecoilValue(workflowIdState);

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  /**
   * This function is used in a context where dependencies shouldn't change much.
   * That's why its wrapped in a `useCallback` hook. Removing memoization might break the app unexpectedly.
   */
  const startNodeCreation = useCallback(
    (parentNodeId: string) => {
      setWorkflowCreateStepFromParentStepId(parentNodeId);

      if (isCommandMenuV2Enabled && isDefined(workflowId)) {
        openWorkflowActionInCommandMenu(workflowId);
        return;
      }

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepSelectAction, {
        title: 'Select Action',
        Icon: IconSettingsAutomation,
      });
    },
    [
      setWorkflowCreateStepFromParentStepId,
      isCommandMenuV2Enabled,
      openWorkflowActionInCommandMenu,
      workflowId,
      setHotkeyScope,
      openRightDrawer,
    ],
  );

  return {
    startNodeCreation,
  };
};
