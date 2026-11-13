import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { type CoreWorkflowRunSummary } from '@/object-core/workflows/types/CoreWorkflowRunSummary';
import { buildCoreWorkflowTableRows } from '@/object-core/workflows/utils/buildCoreWorkflowTableRows';
import {
  CoreWorkflowStatus,
  CoreWorkflowRunStatus,
  WorkflowVisibility,
} from '~/generated/graphql';

const buildCoreWorkflow = (id: string): CoreWorkflow => ({
  __typename: 'CoreWorkflowDTO',
  id,
  name: `Workflow ${id}`,
  statuses: [CoreWorkflowStatus.ACTIVE],
  workspaceWorkflowId: null,
  isSystem: false,
  visibility: WorkflowVisibility.WORKSPACE,
  canChangeVisibility: true,
  updatedAt: '2026-11-01T00:00:00.000Z',
});

describe('buildCoreWorkflowTableRows', () => {
  it('uses the most recent run as the last run', () => {
    const runSummary: CoreWorkflowRunSummary = {
      __typename: 'CoreWorkflowRunSummary',
      coreWorkflowId: 'with-runs',
      runCountLast14Days: 42,
      isRunCountLowerBound: false,
      recentRuns: [
        {
          __typename: 'CoreWorkflowRecentRun',
          id: 'newest',
          status: CoreWorkflowRunStatus.FAILED,
          createdAt: '2026-11-10T10:00:00.000Z',
        },
        {
          __typename: 'CoreWorkflowRecentRun',
          id: 'older',
          status: CoreWorkflowRunStatus.COMPLETED,
          createdAt: '2026-11-09T10:00:00.000Z',
        },
      ],
    };

    const [row] = buildCoreWorkflowTableRows({
      coreWorkflows: [buildCoreWorkflow('with-runs')],
      runSummaryByCoreWorkflowId: new Map([['with-runs', runSummary]]),
    });

    expect(row.lastRunAt).toBe('2026-11-10T10:00:00.000Z');
    expect(row.runCountLast14Days).toBe(42);
    expect(row.recentRuns).toHaveLength(2);
  });

  it('keeps a real zero for a workflow that never ran', () => {
    const [row] = buildCoreWorkflowTableRows({
      coreWorkflows: [buildCoreWorkflow('never-ran')],
      runSummaryByCoreWorkflowId: new Map([
        [
          'never-ran',
          {
            __typename: 'CoreWorkflowRunSummary',
            coreWorkflowId: 'never-ran',
            runCountLast14Days: 0,
            isRunCountLowerBound: false,
            recentRuns: [],
          },
        ],
      ]),
    });

    expect(row.lastRunAt).toBeNull();
    expect(row.runCountLast14Days).toBe(0);
    expect(row.recentRuns).toEqual([]);
  });

  it('leaves run fields empty when no summary was returned', () => {
    const [row] = buildCoreWorkflowTableRows({
      coreWorkflows: [buildCoreWorkflow('unreadable-runs')],
      runSummaryByCoreWorkflowId: new Map(),
    });

    expect(row.lastRunAt).toBeNull();
    expect(row.runCountLast14Days).toBeNull();
    expect(row.recentRuns).toBeNull();
  });
});
