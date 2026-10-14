import { patchStaleRecordNodes } from '@/sse-db-event/utils/patchStaleRecordNodes';
import { isDefined } from 'twenty-shared/utils';

const STALE_UPDATED_AT = '2026-10-13T10:00:01.000Z';
const SSE_UPDATED_AT = '2026-10-13T10:00:02.000Z';

const SSE_WORKFLOW_RUN = {
  id: 'run-1',
  status: 'COMPLETED',
  updatedAt: SSE_UPDATED_AT,
  endedAt: SSE_UPDATED_AT,
  output: { id: 'external-1', value: 'new' },
  createdBy: { source: 'MANUAL', name: 'Tim Apple' },
};

const findNewerRecord = ({
  cacheId,
  updatedAt,
}: {
  cacheId: string;
  updatedAt: string | undefined;
}) =>
  cacheId === 'WorkflowRun:run-1' &&
  isDefined(updatedAt) &&
  Date.parse(updatedAt) < Date.parse(SSE_UPDATED_AT)
    ? SSE_WORKFLOW_RUN
    : undefined;

const buildWorkflowRunNode = (updatedAt: string) => ({
  __typename: 'WorkflowRun',
  id: 'run-1',
  status: 'RUNNING',
  updatedAt,
  endedAt: null,
  output: { id: 'external-1', value: 'old' },
  createdBy: {
    __typename: 'Actor',
    source: 'MANUAL',
    name: 'Tim',
    workspaceMemberId: 'workspace-member-1',
  },
  workflowId: 'workflow-1',
  workflow: { __typename: 'Workflow', id: 'workflow-1', name: 'Quick lead' },
});

describe('patchStaleRecordNodes', () => {
  it('should replace stale fields with the values applied from SSE', () => {
    const data = { workflowRun: buildWorkflowRunNode(STALE_UPDATED_AT) };

    const patchedData = patchStaleRecordNodes({ data, findNewerRecord });

    expect(patchedData.workflowRun).toEqual({
      ...data.workflowRun,
      status: 'COMPLETED',
      updatedAt: SSE_UPDATED_AT,
      endedAt: SSE_UPDATED_AT,
      output: { id: 'external-1', value: 'new' },
      createdBy: {
        __typename: 'Actor',
        source: 'MANUAL',
        name: 'Tim Apple',
        workspaceMemberId: 'workspace-member-1',
      },
    });
  });

  it('should patch stale records nested in connections', () => {
    const data = {
      workflowRuns: {
        __typename: 'WorkflowRunConnection',
        edges: [
          {
            __typename: 'WorkflowRunEdge',
            cursor: 'cursor-1',
            node: buildWorkflowRunNode(STALE_UPDATED_AT),
          },
        ],
      },
    };

    const patchedData = patchStaleRecordNodes({ data, findNewerRecord });

    expect(patchedData.workflowRuns).toMatchObject({
      edges: [{ cursor: 'cursor-1', node: { status: 'COMPLETED' } }],
    });
  });

  it('should return the same data when no record is stale', () => {
    const data = { workflowRun: buildWorkflowRunNode(SSE_UPDATED_AT) };

    expect(patchStaleRecordNodes({ data, findNewerRecord })).toBe(data);
  });

  it('should look up records selected without updatedAt', () => {
    const findNewerStepLogs = jest.fn(() => ({
      stepLogs: { 'step-1': 'completed' },
    }));
    const data = {
      workflowRun: {
        __typename: 'WorkflowRun',
        id: 'run-1',
        stepLogs: { 'step-1': 'running' },
      },
    };

    const patchedData = patchStaleRecordNodes({
      data,
      findNewerRecord: findNewerStepLogs,
    });

    expect(findNewerStepLogs).toHaveBeenCalledTimes(1);
    expect(findNewerStepLogs).toHaveBeenCalledWith({
      cacheId: 'WorkflowRun:run-1',
      updatedAt: undefined,
    });
    expect(patchedData.workflowRun).toEqual({
      __typename: 'WorkflowRun',
      id: 'run-1',
      stepLogs: { 'step-1': 'completed' },
    });
  });
});
