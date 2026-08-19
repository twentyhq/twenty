import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';

describe('computeCoreWorkflowStatuses', () => {
  it('should return an empty list when the workflow has no non-archived version', () => {
    expect(
      computeCoreWorkflowStatuses({
        hasDraftVersion: false,
        hasActiveVersion: false,
        hasDeactivatedVersion: false,
      }),
    ).toEqual([]);
  });

  it('should return every present status in DRAFT, ACTIVE, DEACTIVATED order', () => {
    expect(
      computeCoreWorkflowStatuses({
        hasDraftVersion: true,
        hasActiveVersion: true,
        hasDeactivatedVersion: true,
      }),
    ).toEqual(['DRAFT', 'ACTIVE', 'DEACTIVATED']);
  });

  it('should return only the statuses that are present', () => {
    expect(
      computeCoreWorkflowStatuses({
        hasDraftVersion: false,
        hasActiveVersion: true,
        hasDeactivatedVersion: false,
      }),
    ).toEqual(['ACTIVE']);

    expect(
      computeCoreWorkflowStatuses({
        hasDraftVersion: true,
        hasActiveVersion: false,
        hasDeactivatedVersion: true,
      }),
    ).toEqual(['DRAFT', 'DEACTIVATED']);
  });
});
