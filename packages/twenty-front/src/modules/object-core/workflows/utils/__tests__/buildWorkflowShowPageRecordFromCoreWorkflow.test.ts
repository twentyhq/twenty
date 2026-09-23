import { buildWorkflowShowPageRecordFromCoreWorkflow } from '@/object-core/workflows/utils/buildWorkflowShowPageRecordFromCoreWorkflow';
import { CoreWorkflowStatus, WorkflowVisibility } from '~/generated/graphql';

describe('buildWorkflowShowPageRecordFromCoreWorkflow', () => {
  const coreWorkflow = {
    __typename: 'CoreWorkflowDTO' as const,
    id: 'core-workflow-id',
    name: 'My workflow',
    statuses: [CoreWorkflowStatus.ACTIVE],
    lastPublishedCoreWorkflowVersionId: 'published-version-id',
    workspaceWorkflowId: 'workspace-workflow-id',
    visibility: WorkflowVisibility.WORKSPACE,
    canChangeVisibility: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-14T00:00:00.000Z',
  };

  it('keeps core IDs in the command context resource', () => {
    const record = buildWorkflowShowPageRecordFromCoreWorkflow(coreWorkflow);

    expect(record).toEqual({
      __typename: 'Workflow',
      id: 'core-workflow-id',
      name: 'My workflow',
      statuses: [CoreWorkflowStatus.ACTIVE],
      lastPublishedVersionId: 'published-version-id',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-14T00:00:00.000Z',
      deletedAt: null,
    });
  });

  it('returns undefined when the core row is missing', () => {
    expect(buildWorkflowShowPageRecordFromCoreWorkflow(null)).toBeUndefined();
    expect(
      buildWorkflowShowPageRecordFromCoreWorkflow(undefined),
    ).toBeUndefined();
  });

  it('supports a core row without a workspace pointer', () => {
    expect(
      buildWorkflowShowPageRecordFromCoreWorkflow({
        ...coreWorkflow,
        workspaceWorkflowId: null,
      })?.id,
    ).toBe('core-workflow-id');
  });

  it('defaults a null name to an empty string', () => {
    expect(
      buildWorkflowShowPageRecordFromCoreWorkflow({
        ...coreWorkflow,
        name: null,
      })?.name,
    ).toBe('');
  });
});
