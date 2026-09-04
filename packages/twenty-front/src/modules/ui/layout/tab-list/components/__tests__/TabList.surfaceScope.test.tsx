import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const TAB_LIST_ID = 'http-request-tabs';
const SIDE_PANEL_INSTANCE_ID = 'side-panel-page-7c3f';

const TABS = [
  { id: 'configuration', title: 'Configuration' },
  { id: 'test', title: 'Test' },
];

// Stands in for the step editors: it owns the tab content and renders the tab
// list as a child, so it can only name the same raw instance id - it sits above
// the provider the tab list creates.
const TabContentSibling = () => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    TAB_LIST_ID,
  );

  return <div data-testid="active-tab">{activeTabId ?? 'none'}</div>;
};

const renderOnSurface = (
  surface: 'main' | 'side-panel',
  store = createStore(),
) => {
  render(
    <JotaiProvider store={store}>
      <MemoryRouter>
        <WorkspaceSurfaceContext.Provider
          value={{
            type: surface,
            instanceId:
              surface === 'main'
                ? MAIN_CONTEXT_STORE_INSTANCE_ID
                : SIDE_PANEL_INSTANCE_ID,
            ownsRouteLocation: false,
          }}
        >
          <TabList
            tabs={TABS}
            componentInstanceId={TAB_LIST_ID}
            behaveAsLinks={false}
          />
          <TabContentSibling />
        </WorkspaceSurfaceContext.Provider>
      </MemoryRouter>
    </JotaiProvider>,
  );

  return store;
};

describe('TabList surface scoping', () => {
  it.each(['main', 'side-panel'] as const)(
    'lets the tab content read the selected tab by its raw id on the %s surface',
    async (surface) => {
      renderOnSurface(surface);

      await userEvent.click(screen.getByTestId('tab-test'));

      expect(await screen.findByTestId('active-tab')).toHaveTextContent('test');
    },
  );
});
