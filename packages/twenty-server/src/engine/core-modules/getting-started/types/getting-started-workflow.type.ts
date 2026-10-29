import { type MessageDescriptor } from '@lingui/core';
import { type WorkflowManifest } from 'twenty-shared/application';

export type GettingStartedWorkflow = {
  manifest: WorkflowManifest;
  triggerTitle: MessageDescriptor;
  // Keyed by step universal identifier; steps without a title stay out of the preview
  stepTitles: Partial<Record<string, MessageDescriptor>>;
};
