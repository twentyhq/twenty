import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { assertWorkflowWithCurrentVersionIsDefined } from '../assertWorkflowWithCurrentVersionIsDefined';

it('throws when provided workflow is undefined', () => {
  expect(() => {
    assertWorkflowWithCurrentVersionIsDefined(undefined);
  }).toThrow();
});

it("throws when provided workflow's current version is undefined", () => {
  expect(() => {
    assertWorkflowWithCurrentVersionIsDefined(
      {} as unknown as WorkflowWithCurrentVersion,
    );
  }).toThrow();
});
