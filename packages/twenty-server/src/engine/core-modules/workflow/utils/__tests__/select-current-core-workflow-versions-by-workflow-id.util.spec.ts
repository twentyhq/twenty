import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { selectCurrentCoreWorkflowVersionsByWorkflowId } from 'src/engine/core-modules/workflow/utils/select-current-core-workflow-versions-by-workflow-id.util';

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
}) => ({ id, workflowId, status, createdAt });

describe('selectCurrentCoreWorkflowVersionsByWorkflowId', () => {
  it('selects one current version per workflow', () => {
    const result = selectCurrentCoreWorkflowVersionsByWorkflowId([
      buildRow({ id: 'a1', workflowId: 'w1', createdAt: '2026-01-01' }),
      buildRow({ id: 'b1', workflowId: 'w2', createdAt: '2026-01-02' }),
    ]);

    expect(result['w1']?.currentVersion.id).toBe('a1');
    expect(result['w2']?.currentVersion.id).toBe('b1');
  });

  it('prefers a draft and reports its position from the oldest version', () => {
    const result = selectCurrentCoreWorkflowVersionsByWorkflowId([
      buildRow({ id: 'a1', workflowId: 'w1', createdAt: '2026-01-01' }),
      buildRow({
        id: 'a2',
        workflowId: 'w1',
        status: WorkflowVersionStatus.DRAFT,
        createdAt: '2026-01-02',
      }),
      buildRow({ id: 'a3', workflowId: 'w1', createdAt: '2026-01-03' }),
    ]);

    expect(result['w1']?.currentVersion.id).toBe('a2');
    expect(result['w1']?.positionFromOldest).toBe(2);
  });

  it('positions each workflow independently', () => {
    const result = selectCurrentCoreWorkflowVersionsByWorkflowId([
      buildRow({ id: 'a1', workflowId: 'w1', createdAt: '2026-01-01' }),
      buildRow({ id: 'a2', workflowId: 'w1', createdAt: '2026-01-02' }),
      buildRow({ id: 'b1', workflowId: 'w2', createdAt: '2026-01-03' }),
    ]);

    expect(result['w1']?.positionFromOldest).toBe(2);
    expect(result['w2']?.positionFromOldest).toBe(1);
  });

  it('returns an empty map for no versions', () => {
    expect(selectCurrentCoreWorkflowVersionsByWorkflowId([])).toEqual({});
  });
});
