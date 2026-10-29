import { type MessageDescriptor } from '@lingui/core';

export type GettingStartedStepContent = {
  title: MessageDescriptor;
  doneTitle: MessageDescriptor;
  description: MessageDescriptor;
  icon: string;
  iconColor: string;
  prompt?: {
    label: MessageDescriptor;
    text: MessageDescriptor;
  };
};
