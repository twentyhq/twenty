import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type CoreWorkflowStatus } from '@/object-core/workflows/types/CoreWorkflowStatus';

export const WORKFLOW_CORE_STATUS_TAG: Record<
  CoreWorkflowStatus,
  { label: MessageDescriptor; color: 'green' | 'yellow' | 'gray' }
> = {
  ACTIVE: { label: msg`Active`, color: 'green' },
  DRAFT: { label: msg`Draft`, color: 'yellow' },
  DEACTIVATED: { label: msg`Deactivated`, color: 'gray' },
};
