import { buildPublishedWorkflowVersionPointers } from 'src/engine/core-modules/workflow/utils/build-published-workflow-version-pointers.util';

describe('buildPublishedWorkflowVersionPointers', () => {
  it('should keep the workspace alias when the published version has one', () => {
    expect(
      buildPublishedWorkflowVersionPointers({
        coreWorkflowVersionId: 'core-version-id',
        workspaceWorkflowVersionId: 'workspace-version-id',
      }),
    ).toEqual({
      lastPublishedCoreWorkflowVersionId: 'core-version-id',
      lastPublishedVersionId: 'workspace-version-id',
    });
  });

  it('should point lastPublishedVersionId at the core version when there is no workspace alias', () => {
    expect(
      buildPublishedWorkflowVersionPointers({
        coreWorkflowVersionId: 'core-version-id',
        workspaceWorkflowVersionId: null,
      }),
    ).toEqual({
      lastPublishedCoreWorkflowVersionId: 'core-version-id',
      lastPublishedVersionId: 'core-version-id',
    });
  });
});
