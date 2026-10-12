import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CoreWorkflowVersionStatus } from '~/generated/graphql';

export const CORE_WORKFLOW_VERSION_STATUS_LABELS: Record<
  CoreWorkflowVersionStatus,
  MessageDescriptor
> = {
  [CoreWorkflowVersionStatus.DRAFT]: msg`Draft`,
  [CoreWorkflowVersionStatus.ACTIVE]: msg`Active`,
  [CoreWorkflowVersionStatus.DEACTIVATED]: msg`Deactivated`,
  [CoreWorkflowVersionStatus.ARCHIVED]: msg`Archived`,
};
