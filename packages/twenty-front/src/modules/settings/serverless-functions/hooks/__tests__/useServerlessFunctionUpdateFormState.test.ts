import { renderHook } from '@testing-library/react';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { RecoilRoot } from 'recoil';

jest.mock(
  '@/settings/serverless-functions/hooks/useGetOneServerlessFunction',
  () => ({
    useGetOneServerlessFunction: jest.fn(),
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
        serverlessFunction: { sourceCodeFullPath: undefined },
      },
    );
    const { result } = renderHook(
      () => useServerlessFunctionUpdateFormState(serverlessFunctionId),
      {
        wrapper: RecoilRoot,
      },
    );

    const [formValues] = result.current;

    expect(formValues).toEqual({ name: '', description: '', code: '' });
  });
});
