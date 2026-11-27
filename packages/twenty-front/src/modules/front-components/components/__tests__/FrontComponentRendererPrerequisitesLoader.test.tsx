import { render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { FrontComponentRendererPrerequisitesLoader } from '@/front-components/components/FrontComponentRendererPrerequisitesLoader';
import { useFrontComponentRendererPrerequisitesOrThrow } from '@/front-components/contexts/FrontComponentRendererPrerequisitesContext';
import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { frontComponentInitialApplicationAccessTokenComponentState } from '@/front-components/states/frontComponentInitialApplicationAccessTokenComponentState';
import { frontComponentSourcesPreloadComponentState } from '@/front-components/states/frontComponentSourcesPreloadComponentState';
import { type ResolvedFrontComponent } from '@/front-components/types/ResolvedFrontComponent';

const mockLoadFrontComponentApplicationTokenPair = jest.fn();
const mockFetchFrontComponentSources = jest.fn();

jest.mock(
  '@/front-components/hooks/useFrontComponentApplicationTokenPair',
  () => ({
    useFrontComponentApplicationTokenPair: () => ({
      loadFrontComponentApplicationTokenPair:
        mockLoadFrontComponentApplicationTokenPair,
    }),
  }),
);

jest.mock('@/front-components/hooks/useFrontComponentSourceUrls', () => {
  const sourceUrls = {
    componentUrl: 'https://api.twenty.com/rest/front-components/id',
    sdkClientUrls: { core: 'core-url', metadata: 'metadata-url' },
    sharedDependenciesUrl: 'https://api.twenty.com/rest/shared/id',
    hasSharedDependencies: false,
    isSdkClientReady: true,
  };

  return { useFrontComponentSourceUrls: () => sourceUrls };
});

jest.mock(
  '@/front-components/components/FrontComponentLoadErrorToastEffect',
  () => ({
    FrontComponentLoadErrorToastEffect: () => null,
  }),
);

jest.mock('twenty-front-component-renderer', () => ({
  fetchFrontComponentSources: (input: unknown) =>
    mockFetchFrontComponentSources(input),
}));

const INSTANCE_ID = 'front-component-id-instance';

const FRONT_COMPONENT_FIELDS = {
  id: 'front-component-id',
  applicationId: 'application-id',
  builtComponentChecksum: 'checksum',
  usesSdkClient: true,
  frontComponentSharedDependenciesChecksum: null,
};

const FRONT_COMPONENT_FROM_FIND_ONE_QUERY = {
  ...FRONT_COMPONENT_FIELDS,
  name: 'Front component',
} as ResolvedFrontComponent;

const LoadedPrerequisites = () => {
  const { applicationAccessToken, preloadedSourcesPromise } =
    useFrontComponentRendererPrerequisitesOrThrow();

  return (
    <div>
      {applicationAccessToken}
      {preloadedSourcesPromise === undefined ? '' : ' with preloaded sources'}
    </div>
  );
};

const renderLoader = (
  store: ReturnType<typeof createStore>,
  frontComponentFromFindOneQuery?: ResolvedFrontComponent,
): ReactNode => (
  <JotaiProvider store={store}>
    <FrontComponentInstanceContext.Provider value={{ instanceId: INSTANCE_ID }}>
      <FrontComponentRendererPrerequisitesLoader
        frontComponentFieldsNeededToStartLoading={FRONT_COMPONENT_FIELDS}
        frontComponentFromFindOneQuery={frontComponentFromFindOneQuery}
        loadingFallback="Loading"
        unavailableFallback="Unavailable"
      >
        <LoadedPrerequisites />
      </FrontComponentRendererPrerequisitesLoader>
    </FrontComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('FrontComponentRendererPrerequisitesLoader', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockFetchFrontComponentSources.mockResolvedValue({
      componentSource: 'source',
    });
  });

  it('should preload the sources before the find-one query answers, then hand them to its children', async () => {
    mockLoadFrontComponentApplicationTokenPair.mockResolvedValue({
      applicationAccessToken: { token: 'access-token' },
    });

    const store = createStore();
    const { rerender, unmount } = render(renderLoader(store));

    await waitFor(() =>
      expect(mockFetchFrontComponentSources).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationAccessToken: 'access-token',
          shouldPrefetchSdkClientSources: true,
        }),
      ),
    );
    expect(screen.getByText('Loading')).toBeInTheDocument();

    rerender(renderLoader(store, FRONT_COMPONENT_FROM_FIND_ONE_QUERY));

    expect(
      screen.getByText('access-token with preloaded sources'),
    ).toBeInTheDocument();
    expect(mockFetchFrontComponentSources).toHaveBeenCalledTimes(1);

    unmount();

    expect(
      store.get(
        frontComponentInitialApplicationAccessTokenComponentState.atomFamily({
          instanceId: INSTANCE_ID,
        }),
      ),
    ).toBeNull();
    expect(
      store.get(
        frontComponentSourcesPreloadComponentState.atomFamily({
          instanceId: INSTANCE_ID,
        }),
      ),
    ).toBeNull();
  });

  it('should show the unavailable fallback when the application token fails to load', async () => {
    mockLoadFrontComponentApplicationTokenPair.mockRejectedValue(
      new Error('token failure'),
    );

    render(renderLoader(createStore(), FRONT_COMPONENT_FROM_FIND_ONE_QUERY));

    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    expect(mockFetchFrontComponentSources).not.toHaveBeenCalled();
  });
});
