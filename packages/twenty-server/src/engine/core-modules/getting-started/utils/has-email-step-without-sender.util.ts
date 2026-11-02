import { isNonEmptyString } from '@sniptt/guards';
import { type WorkflowManifest } from 'twenty-shared/application';

export const hasEmailStepWithoutSender = (manifest: WorkflowManifest) =>
  manifest.version.steps.some(
    (step) =>
      (step.type === 'SEND_EMAIL' || step.type === 'DRAFT_EMAIL') &&
      !isNonEmptyString(step.input.connectedAccountId) &&
      !isNonEmptyString(step.input.connectedAccountHandle),
  );
