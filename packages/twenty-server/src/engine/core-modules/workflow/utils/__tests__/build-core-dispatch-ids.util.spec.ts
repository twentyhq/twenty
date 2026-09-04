import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';

describe('buildCoreDispatchIds', () => {
  it('should keep both ids when both are present', () => {
    expect(
      buildCoreDispatchIds({
        coreWorkflowVersionId: 'core-version-1',
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toEqual({
      coreWorkflowVersionId: 'core-version-1',
      workspaceWorkflowVersionId: 'workspace-version-1',
    });
  });

  it('should collapse a half resolved pair to the legacy shape', () => {
    expect(
      buildCoreDispatchIds({ coreWorkflowVersionId: 'core-version-1' }),
    ).toEqual({
      coreWorkflowVersionId: null,
      workspaceWorkflowVersionId: null,
    });
    expect(
      buildCoreDispatchIds({
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toEqual({
      coreWorkflowVersionId: null,
      workspaceWorkflowVersionId: null,
    });
    expect(buildCoreDispatchIds({})).toEqual({
      coreWorkflowVersionId: null,
      workspaceWorkflowVersionId: null,
    });
  });
});
