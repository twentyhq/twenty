import { useLogicFunctionUpdateFormState } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { act, renderHook } from '@testing-library/react';

jest.mock('@/logic-functions/hooks/useGetOneLogicFunction', () => ({
  useGetOneLogicFunction: jest.fn(),
}));

jest.mock('@/logic-functions/hooks/useGetLogicFunctionSourceCode', () => ({
  useGetLogicFunctionSourceCode: jest.fn(),
}));

const mockCode = 'export const main = async (): Promise<void> => { return; }';

describe('useLogicFunctionUpdateFormState', () => {
  test('should return a form', () => {
    const logicFunctionId = 'logicFunctionId';
    const useGetOneLogicFunctionMock = jest.requireMock(
      '@/logic-functions/hooks/useGetOneLogicFunction',
    );
    const useGetLogicFunctionSourceCodeMock = jest.requireMock(
      '@/logic-functions/hooks/useGetLogicFunctionSourceCode',
    );
    useGetOneLogicFunctionMock.useGetOneLogicFunction.mockReturnValue({
      logicFunction: { name: 'name' },
      loading: false,
    });
    useGetLogicFunctionSourceCodeMock.useGetLogicFunctionSourceCode.mockReturnValue(
      {
        code: mockCode,
        loading: false,
      },
    );
    const { result } = renderHook(() =>
      useLogicFunctionUpdateFormState({ logicFunctionId }),
    );

    const { formValues } = result.current;

    expect(formValues).toEqual({
      name: 'name',
      description: '',
      sourceHandlerCode: '',
      timeoutSeconds: 300,
      cronTriggerSettings: null,
      databaseEventTriggerSettings: null,
      httpRouteTriggerSettings: null,
      toolTriggerSettings: null,
      workflowActionTriggerSettings: null,
    });
  });

  test('applies the loaded source when no code is waiting to be saved', () => {
    jest
      .requireMock('@/logic-functions/hooks/useGetOneLogicFunction')
      .useGetOneLogicFunction.mockReturnValue({
        logicFunction: null,
        loading: false,
      });
    jest
      .requireMock('@/logic-functions/hooks/useGetLogicFunctionSourceCode')
      .useGetLogicFunctionSourceCode.mockReturnValue({
        sourceHandlerCode: mockCode,
        loading: false,
      });

    const { result } = renderHook(() =>
      useLogicFunctionUpdateFormState({ logicFunctionId: 'logicFunctionId' }),
    );

    expect(result.current.formValues.sourceHandlerCode).toBe(mockCode);
  });

  test('keeps code waiting to be saved over a source loaded meanwhile', () => {
    jest
      .requireMock('@/logic-functions/hooks/useGetOneLogicFunction')
      .useGetOneLogicFunction.mockReturnValue({
        logicFunction: null,
        loading: false,
      });
    const useGetLogicFunctionSourceCodeMock = jest.requireMock(
      '@/logic-functions/hooks/useGetLogicFunctionSourceCode',
    ).useGetLogicFunctionSourceCode;

    useGetLogicFunctionSourceCodeMock.mockReturnValue({
      sourceHandlerCode: mockCode,
      loading: false,
    });

    const { result, rerender } = renderHook(
      ({ shouldKeepSourceHandlerCode }) =>
        useLogicFunctionUpdateFormState({
          logicFunctionId: 'logicFunctionId',
          shouldKeepSourceHandlerCode,
        }),
      { initialProps: { shouldKeepSourceHandlerCode: false } },
    );

    act(() => {
      result.current.setFormValues((previousFormValues) => ({
        ...previousFormValues,
        sourceHandlerCode: 'typed code',
      }));
    });

    useGetLogicFunctionSourceCodeMock.mockReturnValue({
      sourceHandlerCode: 'outdated code',
      loading: false,
    });

    rerender({ shouldKeepSourceHandlerCode: true });
    rerender({ shouldKeepSourceHandlerCode: false });

    expect(result.current.formValues.sourceHandlerCode).toBe('typed code');
  });
});
