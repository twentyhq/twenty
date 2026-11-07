import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { useHttpRequestOutputSchema } from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useHttpRequestOutputSchema';
import { act, renderHook } from '@testing-library/react';

const action: WorkflowHttpRequestAction = {
  id: 'http-request-step',
  name: 'HTTP Request',
  type: 'HTTP_REQUEST',
  valid: true,
  settings: {
    input: { url: 'https://api.example.com', method: 'GET' },
    outputSchema: {
      status: { isLeaf: true, type: 'number', label: 'status', value: 200 },
    },
    expectedOutputSchema: { status: 200 },
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

describe('useHttpRequestOutputSchema', () => {
  it('saves a cleared sample without the schema of the previous one', () => {
    const onActionUpdate = jest.fn();
    const { result } = renderHook(() =>
      useHttpRequestOutputSchema({ action, onActionUpdate }),
    );

    act(() => result.current.handleOutputSchemaChange(''));

    expect(onActionUpdate).toHaveBeenCalledWith({
      ...action,
      settings: {
        ...action.settings,
        expectedOutputSchema: {},
        outputSchema: {},
      },
    });
  });
});
