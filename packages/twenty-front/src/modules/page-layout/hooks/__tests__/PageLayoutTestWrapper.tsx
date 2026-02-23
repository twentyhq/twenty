import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import {
  createStore,
  type getDefaultStore,
  Provider as JotaiProvider,
} from 'jotai';
import { type ReactNode, useState } from 'react';
import { RecoilRoot, type MutableSnapshot } from 'recoil';

export const PAGE_LAYOUT_TEST_INSTANCE_ID =
  '20202020-f244-4ae0-906b-78958aa07642';

export const PageLayoutTestWrapper = ({
  children,
  initializeState,
  instanceId: instanceIdFromProps,
  store: storeFromProps,
}: {
  children: ReactNode;
  initializeState?: (snapshot: MutableSnapshot) => void;
  instanceId?: string;
  store?: ReturnType<typeof getDefaultStore>;
}) => {
  const instanceId = instanceIdFromProps ?? PAGE_LAYOUT_TEST_INSTANCE_ID;
  const [defaultStore] = useState(() => createStore());
  const store = storeFromProps ?? defaultStore;

  return (
    <JotaiProvider store={store}>
      <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
        <TabListComponentInstanceContext.Provider
          value={{
            instanceId: getTabListInstanceIdFromPageLayoutId(instanceId),
          }}
        >
          <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
        </TabListComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};
