import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type WorkflowVisibility } from '~/generated/graphql';

export type CoreWorkflowVisibilityOption = {
  value: WorkflowVisibility;
  label: MessageDescriptor;
  contextualText: MessageDescriptor;
  Icon: IconComponent;
};
