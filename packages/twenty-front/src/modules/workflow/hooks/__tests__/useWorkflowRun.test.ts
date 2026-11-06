import { renderHook } from '@testing-library/react';

import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';

const mockUseFindOneRecord = jest.fn();

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => mockUseFindOneRecord(),
}));
jest.mock(
  '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject',
  () => ({
    useGenerateDepthRecordGqlFieldsFromObject: () => ({ recordGqlFields: {} }),
  }),
);

const WORKFLOW_RUN = {
  __typename: 'WorkflowRun',
  id: 'workflow-run-id',
  workflowVersionId: null,
  workflowId: null,
  state: null,
  status: 'COMPLETED',
  createdAt: '2026-11-06T08:00:00.000Z',
  deletedAt: null,
  endedAt: null,
  name: 'Run',
};

const renderUseWorkflowRun = ({ record }: { record: object | undefined }) => {
  mockUseFindOneRecord.mockReturnValue({ record, loading: false });

  return renderHook(() => useWorkflowRun({ workflowRunId: 'workflow-run-id' }))
    .result.current;
};

describe('useWorkflowRun', () => {
  it('should return a run that matches the schema', () => {
    expect(renderUseWorkflowRun({ record: WORKFLOW_RUN })).toMatchObject({
      id: 'workflow-run-id',
    });
  });

  it('should return undefined instead of throwing when a stored run no longer matches the schema', () => {
    expect(
      renderUseWorkflowRun({
        record: { ...WORKFLOW_RUN, state: { flow: { steps: [{}] } } },
      }),
    ).toBeUndefined();
  });

  it('should return undefined while the run is not loaded', () => {
    expect(renderUseWorkflowRun({ record: undefined })).toBeUndefined();
  });
});
