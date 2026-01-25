import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { vi } from 'vitest';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';

vi.mock(
  '@/settings/serverless-functions/hooks/useGetOneServerlessFunction',
  () => ({
    useGetOneServerlessFunction: vi.fn(),
  }),
);

vi.mock(
  '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode',
  () => ({
    useGetOneServerlessFunctionSourceCode: vi.fn(),
  }),
);

describe('useServerlessFunctionUpdateFormState', () => {
  test('should return a form', () => {
    const serverlessFunctionId = 'serverlessFunctionId';
    vi.mocked(useGetOneServerlessFunction).mockReturnValue({
      serverlessFunction: {
        id: '1',
        name: 'name',
        description: null,
        runtime: 'nodejs',
        timeoutSeconds: 30,
        latestVersion: null,
        sourceHandlerPath: '',
        builtHandlerPath: '',
        handlerName: '',
        publishedVersions: [],
        toolInputSchema: null,
        isTool: false,
        createdAt: '',
        updatedAt: '',
        routeTriggers: null,
        cronTriggers: null,
        databaseEventTriggers: null,
      },
      loading: false,
    });
    vi.mocked(useGetOneServerlessFunctionSourceCode).mockReturnValue({
      code: { src: { 'index.ts': 'export const handler = () => {}' } },
      loading: false,
    });
    const { result } = renderHook(
      () => useServerlessFunctionUpdateFormState({ serverlessFunctionId }),
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
