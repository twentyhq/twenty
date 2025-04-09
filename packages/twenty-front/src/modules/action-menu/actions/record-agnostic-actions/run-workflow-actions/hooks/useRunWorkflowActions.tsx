import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { msg } from '@lingui/core/macro';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';

export const useRunWorkflowActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithManualTrigger({});

  const { runWorkflowVersion } = useRunWorkflowVersion();

  if (!isWorkflowEnabled) {
    return { runWorkflowActions: [] };
  }

  const runWorkflowActions = activeWorkflowVersions
    .map((activeWorkflowVersion, index) => {
      if (!isDefined(activeWorkflowVersion.workflow)) {
        return undefined;
      }

      const name = capitalize(activeWorkflowVersion.workflow.name);

      return {
        type: ActionType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionScope.Global,
        label: msg`${name}`,
        position: index,
        Icon: IconSettingsAutomation,
        shouldBeRegistered: () => true,
        useAction: () => {
          return {
            onClick: async () => {
              await runWorkflowVersion({
                workflowVersionId: activeWorkflowVersion.id,
              });
            },
          };
        },
      };
    })
    .filter(isDefined);

  return { runWorkflowActions };
};
