import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { type createStore } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { SidePanelRoutedPage } from '@/side-panel/routing/components/SidePanelRoutedPage';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const MAIN_SURFACE_VIEW_ID = '44444444-4444-4444-4444-444444444444';
const PANEL_VIEW_ID = '55555555-5555-4555-8555-555555555555';

// The panel has to land on a real view of the same object, or the setter it
// would call bails before writing and the guard below proves nothing.
const panelCompaniesView = {
  id: PANEL_VIEW_ID,
  name: 'Companies in the panel',
  icon: 'IconBuildingSkyscraper',
  objectMetadataId: companyObjectMetadataItem.id,
  isActive: true,
} as ViewWithRelations;

// Reads without naming an instance, so what it renders is whichever context
// store the surface around it resolves to.
const MockHostedPageProbe = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  return (
    <div data-testid="hosted-object-id">
      {contextStoreCurrentObjectMetadataItemId}
    </div>
  );
};

// Standing in for the real page so the assertion is about which context store
// the hosted route resolves, not about rendering a record index in jsdom.
jest.mock('~/pages/object-record/RecordIndexPage', () => ({
  RecordIndexPage: () => <MockHostedPageProbe />,
}));

const MainSurfaceProbe = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  return (
    <div data-testid="main-object-id">
      {contextStoreCurrentObjectMetadataItemId}
    </div>
  );
};

let jotaiStore: ReturnType<typeof createStore>;

const renderHostedRecordIndex = (path: string) => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store: ReturnType<typeof createStore>) => {
      jotaiStore = store;

      setTestViewsInMetadataStore(store, [panelCompaniesView]);

      store.set(
        sidePanelRoutedPagePathComponentState.atomFamily({
          instanceId: PAGE_INSTANCE_ID,
        }),
        path,
      );

      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        personObjectMetadataItem.id,
      );

      store.set(lastVisitedViewPerObjectMetadataItemState.atom, {
        [companyObjectMetadataItem.id]: MAIN_SURFACE_VIEW_ID,
      });
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SidePanelPageComponentInstanceContext.Provider
            value={{ instanceId: PAGE_INSTANCE_ID }}
          >
            {children}
          </SidePanelPageComponentInstanceContext.Provider>
        </MemoryRouter>
      </I18nProvider>
    </BaseWrapper>
  );

  return render(
    <>
      <MainSurfaceProbe />
      <SidePanelRoutedPage />
    </>,
    { wrapper },
  );
};

describe('a record index hosted in the side panel', () => {
  it('should fill its own context store from the panel path and leave the main one alone', async () => {
    renderHostedRecordIndex(`/objects/${companyObjectMetadataItem.namePlural}`);

    const hostedProbe = await screen.findByTestId(
      'hosted-object-id',
      {},
      // The hosted route is loaded lazily, as the main route tree loads it.
      { timeout: 10000 },
    );

    await waitFor(() =>
      expect(hostedProbe).toHaveTextContent(companyObjectMetadataItem.id),
    );

    expect(screen.getByTestId('main-object-id')).toHaveTextContent(
      personObjectMetadataItem.id,
    );
  });

  it('should not move the view the sidebar links each object to', async () => {
    renderHostedRecordIndex(
      `/objects/${companyObjectMetadataItem.namePlural}?viewId=${PANEL_VIEW_ID}`,
    );

    const hostedProbe = await screen.findByTestId(
      'hosted-object-id',
      {},
      { timeout: 10000 },
    );

    await waitFor(() =>
      expect(hostedProbe).toHaveTextContent(companyObjectMetadataItem.id),
    );

    expect(
      jotaiStore.get(lastVisitedViewPerObjectMetadataItemState.atom),
    ).toEqual({ [companyObjectMetadataItem.id]: MAIN_SURFACE_VIEW_ID });
  });
});
