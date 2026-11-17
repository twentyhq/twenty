import { StandardObjectNameSingular } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';

export const getEmptyStateTitle = (
  objectNameSingular: string,
  objectLabel: string,
) => {
  if (objectNameSingular === StandardObjectNameSingular.WorkflowRun) {
    return t`No workflow runs yet`;
  }

  return t`Add your first ${objectLabel}`;
};
