import { buildWorkflowShowPageRecordFromCoreWorkflow } from '@/object-core/workflows/utils/buildWorkflowShowPageRecordFromCoreWorkflow';
import { CoreWorkflowStatus } from '~/generated/graphql';

describe('buildWorkflowShowPageRecordFromCoreWorkflow', () => {
  const coreWorkflow = {
    __typename: 'CoreWorkflowDTO' as const,
    id: 'core-workflow-id',
    name: 'My workflow',
    statuses: [CoreWorkflowStatus.ACTIVE],
    lastPublishedVersionId: 'published-version-id',
    workspaceWorkflowId: 'workspace-workflow-id',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-14T00:00:00.000Z',
  };

  it('maps the core workflow onto the workspace record shape', () => {
    const record = buildWorkflowShowPageRecordFromCoreWorkflow(coreWorkflow);

    expect(record).toEqual({
      __typename: 'Workflow',
      id: 'workspace-workflow-id',
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

  it('returns undefined when the core row has no workspace pointer', () => {
    expect(
      buildWorkflowShowPageRecordFromCoreWorkflow({
        ...coreWorkflow,
        workspaceWorkflowId: null,
      }),
    ).toBeUndefined();
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
