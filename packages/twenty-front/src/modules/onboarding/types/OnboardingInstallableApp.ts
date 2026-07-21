import { type MessageDescriptor } from '@lingui/core';

export type OnboardingInstallableApp = {
  universalIdentifier: string;
  label: MessageDescriptor;
  description: MessageDescriptor;
};
