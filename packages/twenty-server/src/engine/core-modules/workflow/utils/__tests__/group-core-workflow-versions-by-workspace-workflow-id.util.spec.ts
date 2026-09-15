import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import {
  groupCoreWorkflowVersionsByWorkspaceWorkflowId,
  type CoreWorkflowVersionMetadataRow,
} from 'src/engine/core-modules/workflow/utils/group-core-workflow-versions-by-workspace-workflow-id.util';

const buildRow = ({
  id,
  workflowId,
  status = WorkflowVersionStatus.ARCHIVED,
  createdAt,
}: {
  id: string;
  workflowId: string;
  status?: WorkflowVersionStatus;
  createdAt: string;
}): CoreWorkflowVersionMetadataRow => ({
  id,
  workflowId,
  status,
  createdAt: new Date(createdAt),
  updatedAt: new Date(createdAt),
});

describe('groupCoreWorkflowVersionsByWorkspaceWorkflowId', () => {
  it('groups versions under their workspace workflow id', () => {
    const result = groupCoreWorkflowVersionsByWorkspaceWorkflowId({
      coreWorkflowVersions: [
        buildRow({ id: 'a1', workflowId: 'w1', createdAt: '2026-01-01' }),
        buildRow({ id: 'b1', workflowId: 'w2', createdAt: '2026-01-01' }),
      ],
      workspaceVersionIdByCoreVersionId: {},
    });

    expect([...Object.keys(result)].sort()).toEqual(['w1', 'w2']);
    expect(result['w1']).toHaveLength(1);
    expect(result['w2']).toHaveLength(1);
  });

  it('labels each workflow independently from its own oldest version', () => {
    const result = groupCoreWorkflowVersionsByWorkspaceWorkflowId({
      coreWorkflowVersions: [
        buildRow({ id: 'a1', workflowId: 'w1', createdAt: '2026-01-01' }),
        buildRow({ id: 'a2', workflowId: 'w1', createdAt: '2026-01-02' }),
        buildRow({ id: 'b1', workflowId: 'w2', createdAt: '2026-01-03' }),
      ],
      workspaceVersionIdByCoreVersionId: {},
    });

    expect(result['w1']?.map((version) => version.label)).toEqual(['v2', 'v1']);
    expect(result['w2']?.map((version) => version.label)).toEqual(['v1']);
  });

  it('returns each workflow newest first', () => {
    const result = groupCoreWorkflowVersionsByWorkspaceWorkflowId({
      coreWorkflowVersions: [
        buildRow({ id: 'a1', workflowId: 'w1', createdAt: '2026-01-01' }),
        buildRow({ id: 'a2', workflowId: 'w1', createdAt: '2026-01-02' }),
      ],
      workspaceVersionIdByCoreVersionId: {},
    });

    expect(result['w1']?.map((version) => version.id)).toEqual(['a2', 'a1']);
  });

  it('maps the workspace version id when the link exists and null otherwise', () => {
    const result = groupCoreWorkflowVersionsByWorkspaceWorkflowId({
      coreWorkflowVersions: [
        buildRow({ id: 'a1', workflowId: 'w1', createdAt: '2026-01-01' }),
        buildRow({ id: 'a2', workflowId: 'w1', createdAt: '2026-01-02' }),
      ],
      workspaceVersionIdByCoreVersionId: { a1: 'workspace-a1' },
    });

    expect(
      result['w1']?.map((version) => version.workspaceWorkflowVersionId),
    ).toEqual([null, 'workspace-a1']);
  });

  it('returns an empty map for no versions', () => {
    expect(
      groupCoreWorkflowVersionsByWorkspaceWorkflowId({
        coreWorkflowVersions: [],
        workspaceVersionIdByCoreVersionId: {},
      }),
    ).toEqual({});
  });
});
