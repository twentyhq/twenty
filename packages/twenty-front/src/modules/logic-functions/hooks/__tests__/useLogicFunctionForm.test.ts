import { useLogicFunctionForm } from '@/logic-functions/hooks/useLogicFunctionForm';
import { act, renderHook } from '@testing-library/react';
import {
  DEFAULT_TOOL_INPUT_SCHEMA,
  getInputSchemaFromSourceCode,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';

jest.mock('@/logic-functions/hooks/useGetOneLogicFunction', () => ({
  useGetOneLogicFunction: jest.fn(),
}));

jest.mock('@/logic-functions/hooks/useGetLogicFunctionSourceCode', () => ({
  useGetLogicFunctionSourceCode: jest.fn(),
}));

jest.mock('@/logic-functions/hooks/usePersistLogicFunction', () => ({
  usePersistLogicFunction: () => ({ updateLogicFunction: jest.fn() }),
}));

jest.mock('twenty-shared/logic-function', () => ({
  ...jest.requireActual('twenty-shared/logic-function'),
  getInputSchemaFromSourceCode: jest.fn(),
}));

const createPendingInputSchema = () => {
  let resolve: (inputSchema: InputJsonSchema) => void = () => {};
  const promise = new Promise<InputJsonSchema>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
};

const renderLogicFunctionForm = () => {
  const useGetOneLogicFunctionMock = jest.requireMock(
    '@/logic-functions/hooks/useGetOneLogicFunction',
  );
  const useGetLogicFunctionSourceCodeMock = jest.requireMock(
    '@/logic-functions/hooks/useGetLogicFunctionSourceCode',
  );
  useGetOneLogicFunctionMock.useGetOneLogicFunction.mockReturnValue({
    logicFunction: undefined,
    loading: false,
  });
  useGetLogicFunctionSourceCodeMock.useGetLogicFunctionSourceCode.mockReturnValue(
    {
      sourceHandlerCode: 'initial code',
      loading: false,
    },
  );

  return renderHook(() =>
    useLogicFunctionForm({ logicFunctionId: 'logicFunctionId' }),
  );
};

describe('useLogicFunctionForm', () => {
  const getInputSchemaFromSourceCodeMock = jest.mocked(
    getInputSchemaFromSourceCode,
  );

  beforeEach(() => {
    getInputSchemaFromSourceCodeMock.mockReset();
  });

  it('should update the source code before its input schema is inferred', () => {
    const pendingInputSchema = createPendingInputSchema();
    getInputSchemaFromSourceCodeMock.mockReturnValueOnce(
      pendingInputSchema.promise,
    );

    const { result } = renderLogicFunctionForm();

    act(() => {
      void result.current.onChange('sourceHandlerCode')('updated code');
    });

    expect(result.current.formValues.sourceHandlerCode).toBe('updated code');
  });

  it('should keep the latest source code when an older inference resolves last', async () => {
    const olderInputSchema = createPendingInputSchema();
    const newerInputSchema = createPendingInputSchema();
    getInputSchemaFromSourceCodeMock
      .mockReturnValueOnce(olderInputSchema.promise)
      .mockReturnValueOnce(newerInputSchema.promise);

    const { result } = renderLogicFunctionForm();

    act(() => {
      void result.current.onChange('sourceHandlerCode')('a');
    });
    act(() => {
      void result.current.onChange('sourceHandlerCode')('ab');
    });

    await act(async () => {
      newerInputSchema.resolve(DEFAULT_TOOL_INPUT_SCHEMA);
    });
    await act(async () => {
      olderInputSchema.resolve(DEFAULT_TOOL_INPUT_SCHEMA);
    });

    expect(result.current.formValues.sourceHandlerCode).toBe('ab');
  });
});
