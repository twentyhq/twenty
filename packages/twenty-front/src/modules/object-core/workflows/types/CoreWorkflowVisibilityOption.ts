import { type MessageDescriptor } from '@lingui/core';

export type CoreWorkflowVisibilityOption = {
  isPrivate: boolean;
  label: MessageDescriptor;
  contextualText: MessageDescriptor;
};
