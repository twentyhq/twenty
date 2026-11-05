import { StandardObjectNameSingular } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';

export const getEmptyStateSubTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === StandardObjectNameSingular.WorkflowVersion) {
    return t`Create a workflow and return here to view its versions`;
  }

  if (objectNameSingular === StandardObjectNameSingular.WorkflowRun) {
    return t`Run a workflow and return here to view its executions`;
  }

  return t`Use our API or add your first ${objectLabel} manually`;
};
