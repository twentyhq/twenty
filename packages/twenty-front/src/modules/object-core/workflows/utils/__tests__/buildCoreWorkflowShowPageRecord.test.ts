import { buildCoreWorkflowShowPageRecord } from '@/object-core/workflows/utils/buildCoreWorkflowShowPageRecord';
import { CoreWorkflowStatus } from '~/generated/graphql';

describe('buildCoreWorkflowShowPageRecord', () => {
  it('keys the record on the core workflow id', () => {
    const record = buildCoreWorkflowShowPageRecord({
      __typename: 'CoreWorkflowDTO',
      id: 'core-workflow-id',
      name: 'My workflow',
      statuses: [CoreWorkflowStatus.ACTIVE],
      lastPublishedVersionId: 'published-version-id',
      workspaceWorkflowId: 'workspace-workflow-id',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-14T00:00:00.000Z',
    });

    expect(record).toEqual({
      __typename: 'Workflow',
      id: 'core-workflow-id',
      coreWorkflowId: 'core-workflow-id',
      workspaceWorkflowId: 'workspace-workflow-id',
      name: 'My workflow',
      statuses: [CoreWorkflowStatus.ACTIVE],
      lastPublishedVersionId: 'published-version-id',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-14T00:00:00.000Z',
      deletedAt: null,
    });
  });

  it('returns undefined when the core row is missing', () => {
    expect(buildCoreWorkflowShowPageRecord(undefined)).toBeUndefined();
    expect(buildCoreWorkflowShowPageRecord(null)).toBeUndefined();
  });
});
