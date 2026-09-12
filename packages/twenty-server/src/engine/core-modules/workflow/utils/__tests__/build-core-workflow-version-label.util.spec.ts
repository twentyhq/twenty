import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';

describe('buildCoreWorkflowVersionLabel', () => {
  it('should number versions from the oldest', () => {
    expect(buildCoreWorkflowVersionLabel(1)).toBe('v1');
    expect(buildCoreWorkflowVersionLabel(12)).toBe('v12');
  });
});
