import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { CoreWorkflowStatus } from '~/generated/graphql';

export type CoreWorkflowStatusFilterOption = {
  value: CoreWorkflowStatus;
  label: MessageDescriptor;
  color: ThemeColor;
};

export const CORE_WORKFLOW_STATUS_FILTER_OPTIONS: CoreWorkflowStatusFilterOption[] =
  [
    {
      value: CoreWorkflowStatus.DRAFT,
      label: msg`Draft`,
      color: 'yellow',
    },
    {
      value: CoreWorkflowStatus.ACTIVE,
      label: msg`Active`,
      color: 'green',
    },
    {
      value: CoreWorkflowStatus.DEACTIVATED,
      label: msg`Deactivated`,
      color: 'gray',
    },
  ];
