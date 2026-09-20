import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCircle,
  IconCircleDashed,
  type IconComponent,
} from 'twenty-ui/icon';

import { WorkflowVisibility } from '~/generated/graphql';

export type CoreWorkflowVisibilityOption = {
  value: WorkflowVisibility;
  label: MessageDescriptor;
  contextualText: MessageDescriptor;
  Icon: IconComponent;
};

export const CORE_WORKFLOW_VISIBILITY_OPTIONS: CoreWorkflowVisibilityOption[] =
  [
    {
      value: WorkflowVisibility.WORKSPACE,
      label: msg`Workspace`,
      contextualText: msg`Everyone`,
      Icon: IconCircle,
    },
    {
      value: WorkflowVisibility.PRIVATE,
      label: msg`Private`,
      contextualText: msg`Only you`,
      Icon: IconCircleDashed,
    },
  ];
