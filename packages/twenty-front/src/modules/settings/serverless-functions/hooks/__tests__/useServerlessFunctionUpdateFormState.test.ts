import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

jest.mock(
  '@/settings/serverless-functions/hooks/useGetOneServerlessFunction',
  () => ({
    useGetOneServerlessFunction: jest.fn(),
  }),
);

jest.mock(
  '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode',
  () => ({
    useGetOneServerlessFunctionSourceCode: jest.fn(),
  }),
);

describe('useServerlessFunctionUpdateFormState', () => {
  test('should return a form', () => {
    const serverlessFunctionId = 'serverlessFunctionId';
    const useGetOneServerlessFunctionMock = jest.requireMock(
      '@/settings/serverless-functions/hooks/useGetOneServerlessFunction',
    );
    useGetOneServerlessFunctionMock.useGetOneServerlessFunction.mockReturnValue(
      {
        serverlessFunction: { name: 'name' },
      },
    );
    const useGetOneServerlessFunctionSourceCodeMock = jest.requireMock(
      '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode',
    );
    useGetOneServerlessFunctionSourceCodeMock.useGetOneServerlessFunctionSourceCode.mockReturnValue(
      {
        code: 'export const handler = () => {}',
      },
    );
    const { result } = renderHook(
      () => useServerlessFunctionUpdateFormState({ serverlessFunctionId }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { formValues } = result.current;

    expect(formValues).toEqual({ name: '', description: '', code: undefined });
  });
});
