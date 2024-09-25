import {
  Workflow,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function assertWorkflowWithCurrentVersionIsDefined(
  workflow: WorkflowWithCurrentVersion | undefined,
): asserts workflow is Workflow & { currentVersion: WorkflowVersion } {
  if (!isDefined(workflow) || !isDefined(workflow.currentVersion)) {
    throw new Error('Expected workflow and its current version to be defined');
  }
}
