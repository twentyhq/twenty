import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { PageLayoutSidePanelStateProvider } from '@/side-panel/pages/page-layout/components/PageLayoutSidePanelStateProvider';
import { usePageLayoutIdFromContextStoreOrNull } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
);

const PAGE_LAYOUT_ID = 'page-layout-id';
const TAB_ID = 'tab-id';

const StateReader = () => {
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
  );
  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  return (
    <output aria-label="Page layout state">
      {pageLayoutDraft.id}:{activeTabId}
    </output>
  );
};

describe('PageLayoutSidePanelStateProvider', () => {
  it('reads the originating dashboard page layout and tab state', () => {
    jest.mocked(usePageLayoutIdFromContextStoreOrNull).mockReturnValue({
      pageLayoutId: PAGE_LAYOUT_ID,
      recordId: 'dashboard-id',
      objectMetadataItemId: 'dashboard-object-metadata-id',
      objectNameSingular: 'dashboard',
    });

    const store = createStore();
    const pageLayoutDraft = {
      ...makeDraft([makeTab(TAB_ID, [])]),
      id: PAGE_LAYOUT_ID,
      type: PageLayoutType.DASHBOARD,
    };

    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      pageLayoutDraft,
    );
    store.set(
      activeTabIdComponentState.atomFamily({
        instanceId: getTabListInstanceIdFromPageLayoutId(PAGE_LAYOUT_ID),
      }),
      TAB_ID,
    );

    render(
      <Provider store={store}>
        <WorkspaceSurfaceContext.Provider
          value={{
            type: 'side-panel',
            instanceId: 'side-panel-page-id',
            ownsRouteLocation: false,
          }}
        >
          <PageLayoutSidePanelStateProvider>
            <StateReader />
          </PageLayoutSidePanelStateProvider>
        </WorkspaceSurfaceContext.Provider>
      </Provider>,
    );

    expect(
      screen.getByRole('status', { name: 'Page layout state' }),
    ).toHaveTextContent(`${PAGE_LAYOUT_ID}:${TAB_ID}`);
  });
});
