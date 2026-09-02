import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import { createRelatedRecordTargetComponentState } from '@/side-panel/pages/create-related-record/states/createRelatedRecordTargetComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type PropsWithChildren } from 'react';

const PAGE_ID = 'purpose-built-page-id';

describe('purpose-built side-panel page state', () => {
  it('reads state seeded with the side-panel page instance ID', () => {
    const store = createStore();
    const targetRecord = {
      id: 'record-id',
      targetObjectNameSingular: 'company',
    };

    store.set(
      composeEmailConnectedAccountIdComponentState.atomFamily({
        instanceId: PAGE_ID,
      }),
      'connected-account-id',
    );
    store.set(
      createRelatedRecordTargetComponentState.atomFamily({
        instanceId: PAGE_ID,
      }),
      targetRecord,
    );

    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: PAGE_ID }}
        >
          <WorkspaceSurfaceContext.Provider
            value={{
              type: 'side-panel',
              instanceId: PAGE_ID,
              ownsRouteLocation: false,
            }}
          >
            {children}
          </WorkspaceSurfaceContext.Provider>
        </SidePanelPageComponentInstanceContext.Provider>
      </Provider>
    );

    const { result } = renderHook(
      () => ({
        connectedAccountId: useAtomComponentStateValue(
          composeEmailConnectedAccountIdComponentState,
        ),
        targetRecord: useAtomComponentStateValue(
          createRelatedRecordTargetComponentState,
        ),
      }),
      { wrapper },
    );

    expect(result.current).toEqual({
      connectedAccountId: 'connected-account-id',
      targetRecord,
    });
  });
});
