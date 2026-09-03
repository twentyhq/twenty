import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { PageLayoutType } from '~/generated-metadata/graphql';

const TAB_LIST_INSTANCE_ID = 'record-tabs';

const CurrentLocation = () => {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();

  return (
    <>
      <output aria-label="Current URL">{pathname + search + hash}</output>
      <output aria-label="Navigation type">{navigationType}</output>
    </>
  );
};

describe('PageLayoutTabListEffect', () => {
  it.each([
    {
      name: 'replaces the hash when the active tab becomes pinned',
      activeTabId: 'home',
      hash: '#home',
      isInSidePanel: false,
      ownsRouteLocation: true,
      expectedHash: '#timeline',
      expectedActiveTabId: 'timeline',
      expectedNavigationType: 'REPLACE',
    },
    {
      name: 'does not rewrite the main URL for a side-panel fallback',
      activeTabId: 'home',
      hash: '#home',
      isInSidePanel: true,
      ownsRouteLocation: false,
      expectedHash: '#home',
      expectedActiveTabId: 'timeline',
      expectedNavigationType: 'POP',
    },
    {
      name: 'does not add a hash when there was no tab in the URL',
      activeTabId: 'home',
      hash: '',
      isInSidePanel: false,
      ownsRouteLocation: true,
      expectedHash: '',
      expectedActiveTabId: 'timeline',
      expectedNavigationType: 'POP',
    },
    {
      name: 'preserves a valid deep link while replacing a stale active tab',
      activeTabId: 'home',
      hash: '#notes',
      isInSidePanel: false,
      ownsRouteLocation: true,
      expectedHash: '#notes',
      expectedActiveTabId: 'notes',
      expectedNavigationType: 'POP',
    },
    {
      name: 'preserves a valid deep link on initial load',
      activeTabId: null,
      hash: '#notes',
      isInSidePanel: false,
      ownsRouteLocation: true,
      expectedHash: '#notes',
      expectedActiveTabId: 'notes',
      expectedNavigationType: 'POP',
    },
    {
      name: 'keeps a valid active tab and its hash',
      activeTabId: 'notes',
      hash: '#notes',
      isInSidePanel: false,
      ownsRouteLocation: true,
      expectedHash: '#notes',
      expectedActiveTabId: 'notes',
      expectedNavigationType: 'POP',
    },
    {
      name: 'honors a deep-linked tab in a routed side panel',
      activeTabId: null,
      hash: '#notes',
      isInSidePanel: true,
      ownsRouteLocation: true,
      expectedHash: '#notes',
      expectedActiveTabId: 'notes',
      expectedNavigationType: 'POP',
    },
    {
      name: 'replaces a stale hash in the current routed side-panel page',
      activeTabId: 'home',
      hash: '#home',
      isInSidePanel: true,
      ownsRouteLocation: true,
      expectedHash: '#timeline',
      expectedActiveTabId: 'timeline',
      expectedNavigationType: 'REPLACE',
    },
  ])(
    '$name',
    ({
      activeTabId,
      hash,
      isInSidePanel,
      ownsRouteLocation,
      expectedHash,
      expectedActiveTabId,
      expectedNavigationType,
    }) => {
      const store = createStore();
      const surfaceInstanceId = isInSidePanel ? 'side-panel-page-1' : 'main';
      const activeTabAtom = activeTabIdComponentState.atomFamily({
        instanceId: TAB_LIST_INSTANCE_ID,
      });
      store.set(activeTabAtom, activeTabId);

      render(
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[
              `/object/company/record-id?viewId=company-view${hash}`,
            ]}
          >
            <WorkspaceSurfaceContext.Provider
              value={{
                type: isInSidePanel ? 'side-panel' : 'main',
                instanceId: surfaceInstanceId,
                ownsRouteLocation,
              }}
            >
              <LayoutRenderingProvider
                value={{
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: 'record-id',
                    targetObjectNameSingular: 'company',
                  },
                }}
              >
                <TabListComponentInstanceContext.Provider
                  value={{
                    instanceId: TAB_LIST_INSTANCE_ID,
                  }}
                >
                  <PageLayoutTabListEffect
                    tabs={[makeTab('timeline', []), makeTab('notes', [], 1)]}
                    componentInstanceId={TAB_LIST_INSTANCE_ID}
                  />
                  <TabListFromUrlOptionalEffect
                    tabListIds={['timeline', 'notes']}
                  />
                  <CurrentLocation />
                </TabListComponentInstanceContext.Provider>
              </LayoutRenderingProvider>
            </WorkspaceSurfaceContext.Provider>
          </MemoryRouter>
        </Provider>,
      );

      expect(
        screen.getByRole('status', { name: 'Current URL' }),
      ).toHaveTextContent(
        `/object/company/record-id?viewId=company-view${expectedHash}`,
      );
      expect(store.get(activeTabAtom)).toBe(expectedActiveTabId);
      expect(
        screen.getByRole('status', { name: 'Navigation type' }),
      ).toHaveTextContent(expectedNavigationType);
    },
  );
});
