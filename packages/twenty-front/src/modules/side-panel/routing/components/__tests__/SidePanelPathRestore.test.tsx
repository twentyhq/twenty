import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, waitFor } from '@testing-library/react';
import { type getDefaultStore } from 'jotai';
import {
  createPath,
  MemoryRouter,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { StrictMode, type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { SidePanelPathUrlSyncEffect } from '@/side-panel/routing/components/SidePanelPathUrlSyncEffect';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('~/hooks/usePageChangeEffectNavigateLocation', () => ({
  usePageChangeEffectNavigateLocation: () => undefined,
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const OBJECT_PATH = `/settings/objects/${companyObjectMetadataItem.namePlural}`;
const FIELD_PATH = `${OBJECT_PATH}/${nameFieldMetadataItem.name}`;

const routeObjects: WorkspaceRouteObject[] = [
  {
    path: '/settings/*',
    element: null,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
];

// Restoring opens the panel, which is what the sync effect writes the param
// from. Writing before that lands would clear the param being restored, so
// this records every value the url took rather than only where it settled.
const useRecordedSearchValues = (recorded: string[]) => {
  const { search } = useLocation();

  if (recorded.at(-1) !== search) {
    recorded.push(search);
  }
};

const SearchRecorderEffect = ({ recorded }: { recorded: string[] }) => {
  useRecordedSearchValues(recorded);

  return null;
};

describe('restoring the panel from the url', () => {
  it('should open the panel without ever dropping the param it read', async () => {
    const recordedSearchValues: string[] = [];
    let capturedStore: ReturnType<typeof getDefaultStore> | undefined;

    const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      onInitializeJotaiStore: (store) => {
        capturedStore = store;
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BaseWrapper>
        <I18nProvider i18n={i18n}>
          <MemoryRouter
            initialEntries={[
              `/chat?thread=thread-1&panel=${encodeURIComponent(OBJECT_PATH)}`,
            ]}
          >
            <WorkspaceRouteObjectsContext.Provider value={routeObjects}>
              {children}
              <SearchRecorderEffect recorded={recordedSearchValues} />
            </WorkspaceRouteObjectsContext.Provider>
          </MemoryRouter>
        </I18nProvider>
      </BaseWrapper>
    );

    render(
      <StrictMode>
        <SidePanelPathUrlSyncEffect />
        <PageChangeEffect />
      </StrictMode>,
      { wrapper },
    );

    await waitFor(() => {
      expect(
        capturedStore?.get(sidePanelNavigationStackState.atom).at(-1)?.page,
      ).toBe(SidePanelPages.RoutedPage);
    });

    expect(recordedSearchValues).not.toContain('');
    expect(recordedSearchValues.at(-1)).toBe(
      `?thread=thread-1&panel=${encodeURIComponent(OBJECT_PATH)}`,
    );
    expect(capturedStore?.get(sidePanelNavigationStackState.atom)).toHaveLength(
      1,
    );
  });

  it('should follow the panel when it navigates to another hosted route', async () => {
    let openNext: ((path: string) => string | null) | undefined;
    let navigateUrl: ((path: string) => void) | undefined;
    let currentLocation: ReturnType<typeof useLocation> | undefined;
    let capturedStore: ReturnType<typeof getDefaultStore> | undefined;

    const OpenerEffect = () => {
      const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

      openNext = (path: string) => openRoutedPageInSidePanel({ path });

      return null;
    };

    const UrlNavigationProbeEffect = () => {
      const navigate = useNavigate();
      currentLocation = useLocation();
      navigateUrl = (path: string) => navigate(path);

      return null;
    };

    const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      onInitializeJotaiStore: (store) => {
        capturedStore = store;
      },
    });

    const recordedSearchValues: string[] = [];

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BaseWrapper>
        <I18nProvider i18n={i18n}>
          <MemoryRouter
            initialEntries={[
              {
                pathname: '/chat',
                search: `?thread=thread-1&panel=${encodeURIComponent(OBJECT_PATH)}`,
                hash: '#conversation',
                state: { source: 'history' },
              },
            ]}
          >
            <WorkspaceRouteObjectsContext.Provider value={routeObjects}>
              {children}
              <OpenerEffect />
              <UrlNavigationProbeEffect />
              <SearchRecorderEffect recorded={recordedSearchValues} />
            </WorkspaceRouteObjectsContext.Provider>
          </MemoryRouter>
        </I18nProvider>
      </BaseWrapper>
    );

    render(<SidePanelPathUrlSyncEffect />, { wrapper });

    await waitFor(() => {
      expect(openNext).toBeDefined();
      expect(recordedSearchValues.at(-1)).toBe(
        `?thread=thread-1&panel=${encodeURIComponent(OBJECT_PATH)}`,
      );
    });

    act(() => {
      expect(openNext?.('')).toBeNull();
      expect(openNext?.('settings/objects/companies')).toBeNull();
      expect(openNext?.('//example.com/settings/objects/companies')).toBeNull();
      expect(openNext?.('https://example.com/settings')).toBeNull();
    });

    expect(recordedSearchValues.at(-1)).toBe(
      `?thread=thread-1&panel=${encodeURIComponent(OBJECT_PATH)}`,
    );

    act(() => openNext?.(FIELD_PATH));

    await waitFor(() => {
      expect(recordedSearchValues.at(-1)).toBe(
        `?thread=thread-1&panel=${encodeURIComponent(FIELD_PATH)}`,
      );
    });

    expect(currentLocation?.hash).toBe('#conversation');
    expect(currentLocation?.state).toEqual({ source: 'history' });

    const previousNavigationItem = capturedStore
      ?.get(sidePanelNavigationStackState.atom)
      .at(-1);

    const externallySelectedPath = `${OBJECT_PATH}#fields`;

    act(() => {
      navigateUrl?.(
        `/chat?thread=thread-1&panel=${encodeURIComponent(externallySelectedPath)}`,
      );
    });

    await waitFor(() => {
      const currentItem = capturedStore
        ?.get(sidePanelNavigationStackState.atom)
        .at(-1);

      expect(
        currentItem?.routedLocation
          ? createPath(currentItem.routedLocation)
          : null,
      ).toBe(externallySelectedPath);
      expect(currentItem?.pageId).not.toBe(previousNavigationItem?.pageId);
      expect(currentItem?.routedFlowStateScopeId).toBe(currentItem?.pageId);
      expect(
        capturedStore?.get(sidePanelNavigationStackState.atom),
      ).toHaveLength(1);
    });
  });
});
