import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { useWorkflowCodeStepForm } from '@/workflow/workflow-steps/workflow-actions/code-action/hooks/useWorkflowCodeStepForm';
import { act, renderHook, waitFor } from '@testing-library/react';

const CODE_WITH_TWO_INPUTS =
  'export const main = async (params: { a: string; b: string }) => ({});';
const CODE_WITH_ONE_INPUT =
  'export const main = async (params: { b: string }) => ({});';

const ACTION: WorkflowCodeAction = {
  id: 'step-id',
  name: 'Code',
  type: 'CODE',
  valid: true,
  settings: {
    input: {
      code: CODE_WITH_TWO_INPUTS,
      logicFunctionInput: { a: 'old a', b: 'old b' },
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

describe('useWorkflowCodeStepForm', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps an input removed from the code when another input is edited right after', async () => {
    const onActionUpdate = jest.fn();

    const { result } = renderHook(() =>
      useWorkflowCodeStepForm({
        action: ACTION,
        savedCode: ACTION.settings.input.code,
        onActionUpdate,
        onFunctionInputInferred: jest.fn(),
      }),
    );

    act(() => result.current.handleCodeChange(CODE_WITH_ONE_INPUT));
    act(() => jest.advanceTimersByTime(300));
    act(() => result.current.handleFunctionInputChange('new b', ['b']));

    const expectedInput = {
      code: CODE_WITH_ONE_INPUT,
      logicFunctionInput: { b: 'new b' },
    };

    await waitFor(() =>
      expect(onActionUpdate.mock.lastCall?.[0].settings.input).toEqual(
        expectedInput,
      ),
    );

    act(() => jest.runAllTimers());

    expect(onActionUpdate.mock.lastCall[0].settings.input).toEqual(
      expectedInput,
    );
  });

  it('saves settings with the latest code and inputs', async () => {
    const onActionUpdate = jest.fn();

    const { result } = renderHook(() =>
      useWorkflowCodeStepForm({
        action: ACTION,
        savedCode: ACTION.settings.input.code,
        onActionUpdate,
        onFunctionInputInferred: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleFunctionInputChange('new a', ['a']);
      result.current.saveSettings({ expectedOutputSchema: { ok: true } });
    });

    await waitFor(() => expect(onActionUpdate).toHaveBeenCalledTimes(1));

    const savedAction = onActionUpdate.mock.lastCall[0];

    expect(savedAction.settings.expectedOutputSchema).toEqual({ ok: true });
    expect(savedAction.settings.input.logicFunctionInput).toEqual({
      a: 'new a',
      b: 'old b',
    });
  });
});
