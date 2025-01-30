import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { t } from '@lingui/core/macro';

export const getEmptyStateTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkflowVersion) {
    return t`No workflow versions yet`;
  }

  if (objectNameSingular === CoreObjectNameSingular.WorkflowRun) {
    return t`No workflow runs yet`;
  }

  return t`Add your first ${objectLabel}`;
};
