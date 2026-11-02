import { type MessageDescriptor } from '@lingui/core';
import { type WorkflowManifest } from 'twenty-shared/application';

export type GettingStartedWorkflow = {
  manifest: WorkflowManifest;
  triggerTitle: MessageDescriptor;
  stepTitles: Partial<Record<string, MessageDescriptor>>;
};
