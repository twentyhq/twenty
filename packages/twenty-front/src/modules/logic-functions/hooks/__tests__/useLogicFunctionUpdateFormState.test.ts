import { useLogicFunctionUpdateFormState } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

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
    const { result } = renderHook(
      () => useLogicFunctionUpdateFormState({ logicFunctionId }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { formValues } = result.current;

    expect(formValues).toEqual({
      name: '',
      description: '',
      code: mockCode,
    });
  });
});
