import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { CoreWorkflowVersionStatus } from '~/generated/graphql';

export const CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS: Record<
  CoreWorkflowVersionStatus,
  { label: MessageDescriptor; color: ThemeColor }
> = {
  [CoreWorkflowVersionStatus.DRAFT]: { label: msg`Draft`, color: 'yellow' },
  [CoreWorkflowVersionStatus.ACTIVE]: { label: msg`Active`, color: 'green' },
  [CoreWorkflowVersionStatus.DEACTIVATED]: {
    label: msg`Deactivated`,
    color: 'gray',
  },
  [CoreWorkflowVersionStatus.ARCHIVED]: { label: msg`Archived`, color: 'gray' },
};
