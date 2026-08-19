import { computeCoreWorkflowStatus } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-status.util';

describe('computeCoreWorkflowStatus', () => {
  it('should return ACTIVE when the workflow has an active version', () => {
    expect(
      computeCoreWorkflowStatus({
        hasActiveVersion: true,
        hasDraftVersion: false,
      }),
    ).toBe('ACTIVE');
  });

  it('should return ACTIVE when the workflow has both an active and a draft version', () => {
    expect(
      computeCoreWorkflowStatus({
        hasActiveVersion: true,
        hasDraftVersion: true,
      }),
    ).toBe('ACTIVE');
  });

  it('should return DRAFT when the workflow only has a draft version', () => {
    expect(
      computeCoreWorkflowStatus({
        hasActiveVersion: false,
        hasDraftVersion: true,
      }),
    ).toBe('DRAFT');
  });

  it('should return DEACTIVATED when the workflow has no active or draft version', () => {
    expect(
      computeCoreWorkflowStatus({
        hasActiveVersion: false,
        hasDraftVersion: false,
      }),
    ).toBe('DEACTIVATED');
  });
});
