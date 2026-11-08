import { type MessageDescriptor } from '@lingui/core';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

export type GettingStartedStepContent = {
  title: MessageDescriptor;
  doneTitle: MessageDescriptor;
  description: MessageDescriptor;
  doneDescription: MessageDescriptor;
  icon: string;
  iconColor: string;
  prompt?: {
    label: MessageDescriptor;
    getText: (
      companyEnrichment: WorkspaceCompanyEnrichment | null,
    ) => MessageDescriptor;
  };
};
