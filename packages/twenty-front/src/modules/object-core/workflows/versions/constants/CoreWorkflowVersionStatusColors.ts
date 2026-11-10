import { type ThemeColor } from 'twenty-ui/theme';

import { CoreWorkflowVersionStatus } from '~/generated/graphql';

export const CORE_WORKFLOW_VERSION_STATUS_COLORS: Record<
  CoreWorkflowVersionStatus,
  ThemeColor
> = {
  [CoreWorkflowVersionStatus.DRAFT]: 'yellow',
  [CoreWorkflowVersionStatus.ACTIVE]: 'green',
  [CoreWorkflowVersionStatus.DEACTIVATED]: 'orange',
  [CoreWorkflowVersionStatus.ARCHIVED]: 'gray',
};
