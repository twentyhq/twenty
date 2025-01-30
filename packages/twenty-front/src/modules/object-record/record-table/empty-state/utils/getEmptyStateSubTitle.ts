import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { t } from '@lingui/core/macro';

export const getEmptyStateSubTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkflowVersion) {
    return t`Create a workflow and return here to view its versions`;
  }

  if (objectNameSingular === CoreObjectNameSingular.WorkflowRun) {
    return t`Run a workflow and return here to view its executions`;
  }

  return t`Use our API or add your first ${objectLabel} manually`;
};
