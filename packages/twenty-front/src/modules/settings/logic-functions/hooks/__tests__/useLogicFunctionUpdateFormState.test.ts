import { useLogicFunctionUpdateFormState } from '@/settings/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

jest.mock('@/settings/logic-functions/hooks/useGetOneLogicFunction', () => ({
  useGetOneLogicFunction: jest.fn(),
}));

describe('useLogicFunctionUpdateFormState', () => {
  test('should return a form', () => {
    const logicFunctionId = 'logicFunctionId';
    const useGetOneLogicFunctionMock = jest.requireMock(
      '@/settings/logic-functions/hooks/useGetOneLogicFunction',
    );
    useGetOneLogicFunctionMock.useGetOneLogicFunction.mockReturnValue({
      logicFunction: { name: 'name' },
      loading: false,
    });
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
      code: { src: { 'index.ts': '' } },
    });
  });
});
