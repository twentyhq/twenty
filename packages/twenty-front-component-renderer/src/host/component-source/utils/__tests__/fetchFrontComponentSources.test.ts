import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';
import { fetchFrontComponentSources } from '@/host/component-source/utils/fetchFrontComponentSources';
import { fetchSdkClientSources } from '@/host/component-source/utils/fetchSdkClientSources';
import { SDK_CLIENT_IMPORT_SPECIFIERS } from '@/constants/SdkClientImportSpecifiers';

jest.mock('@/host/component-source/utils/fetchComponentSource', () => ({
  fetchComponentSource: jest.fn(),
}));

jest.mock('@/host/component-source/utils/fetchSdkClientSources', () => ({
  fetchSdkClientSources: jest.fn(),
}));

const COMPONENT_URL = 'https://api.twenty.com/rest/front-components/id';
const SHARED_DEPENDENCIES_URL =
  'https://api.twenty.com/rest/front-component-shared-dependencies/id';
const SDK_CLIENT_URLS = {
  core: 'https://api.twenty.com/rest/sdk-client/id/core',
  metadata: 'https://api.twenty.com/rest/sdk-client/metadata',
};
const SDK_CLIENT_SOURCES = { core: 'core source', metadata: 'metadata source' };
const SOURCE_IMPORTING_SDK_CLIENT = `import { CoreApiClient } from '${SDK_CLIENT_IMPORT_SPECIFIERS[0]}';`;
const SOURCE_WITHOUT_IMPORTS = 'export default () => {};';

const mockedFetchComponentSource = jest.mocked(fetchComponentSource);
const mockedFetchSdkClientSources = jest.mocked(fetchSdkClientSources);

const createDeferredComponentSource = () => {
  const control = { resolve: (_source: string) => {} };
  const promise = new Promise<string>((resolve) => {
    control.resolve = resolve;
  });

  return { promise, resolve: (source: string) => control.resolve(source) };
};

describe('fetchFrontComponentSources', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedFetchSdkClientSources.mockResolvedValue(SDK_CLIENT_SOURCES);
  });

  it('should start hinted fetches before the component source arrives', async () => {
    const deferredComponentSource = createDeferredComponentSource();

    mockedFetchComponentSource.mockImplementation(({ url }) =>
      url === COMPONENT_URL
        ? deferredComponentSource.promise
        : Promise.resolve('shared dependencies source'),
    );

    const sourcesPromise = fetchFrontComponentSources({
      componentUrl: COMPONENT_URL,
      sdkClientUrls: SDK_CLIENT_URLS,
      sharedDependenciesUrl: SHARED_DEPENDENCIES_URL,
      applicationAccessToken: 'token',
      shouldPrefetchSdkClientSources: true,
      shouldPrefetchSharedDependenciesSource: true,
    });

    expect(mockedFetchSdkClientSources).toHaveBeenCalledTimes(1);
    expect(mockedFetchComponentSource).toHaveBeenCalledWith({
      url: SHARED_DEPENDENCIES_URL,
      headers: { Authorization: 'Bearer token' },
    });

    deferredComponentSource.resolve(SOURCE_IMPORTING_SDK_CLIENT);

    await expect(sourcesPromise).resolves.toEqual({
      componentSource: SOURCE_IMPORTING_SDK_CLIENT,
      sdkClientSources: SDK_CLIENT_SOURCES,
      sharedDependenciesSource: undefined,
    });
    expect(mockedFetchSdkClientSources).toHaveBeenCalledTimes(1);
  });

  it('should fall back to scanning the component source without hints', async () => {
    const deferredComponentSource = createDeferredComponentSource();

    mockedFetchComponentSource.mockReturnValue(deferredComponentSource.promise);

    const sourcesPromise = fetchFrontComponentSources({
      componentUrl: COMPONENT_URL,
      sdkClientUrls: SDK_CLIENT_URLS,
      sharedDependenciesUrl: SHARED_DEPENDENCIES_URL,
    });

    expect(mockedFetchSdkClientSources).not.toHaveBeenCalled();
    expect(mockedFetchComponentSource).toHaveBeenCalledTimes(1);

    deferredComponentSource.resolve(SOURCE_IMPORTING_SDK_CLIENT);

    await expect(sourcesPromise).resolves.toEqual({
      componentSource: SOURCE_IMPORTING_SDK_CLIENT,
      sdkClientSources: SDK_CLIENT_SOURCES,
      sharedDependenciesSource: undefined,
    });
  });

  it('should ignore a failed hinted fetch the component source does not need', async () => {
    mockedFetchComponentSource.mockResolvedValue(SOURCE_WITHOUT_IMPORTS);
    mockedFetchSdkClientSources.mockRejectedValue(new Error('unreachable'));

    await expect(
      fetchFrontComponentSources({
        componentUrl: COMPONENT_URL,
        sdkClientUrls: SDK_CLIENT_URLS,
        shouldPrefetchSdkClientSources: true,
      }),
    ).resolves.toEqual({
      componentSource: SOURCE_WITHOUT_IMPORTS,
      sdkClientSources: undefined,
      sharedDependenciesSource: undefined,
    });
  });

  it('should surface the failure of a hinted fetch the component source needs', async () => {
    mockedFetchComponentSource.mockResolvedValue(SOURCE_IMPORTING_SDK_CLIENT);
    mockedFetchSdkClientSources.mockRejectedValue(new Error('unreachable'));

    await expect(
      fetchFrontComponentSources({
        componentUrl: COMPONENT_URL,
        sdkClientUrls: SDK_CLIENT_URLS,
        shouldPrefetchSdkClientSources: true,
      }),
    ).rejects.toThrow('unreachable');
    expect(mockedFetchSdkClientSources).toHaveBeenCalledTimes(1);
  });
});
