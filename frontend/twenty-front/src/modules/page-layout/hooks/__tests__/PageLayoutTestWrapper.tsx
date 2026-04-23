import { PageLayoutEditModeProvider } from '@/page-layout/components/PageLayoutEditModeProvider';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import {
  createStore,
  type getDefaultStore,
  Provider as JotaiProvider,
} from 'jotai';
import { type ReactNode, useState } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const PAGE_LAYOUT_TEST_INSTANCE_ID =
  '20202020-f244-4ae0-906b-78958aa07642';

const PageLayoutTestEditModeProvider = ({
  children,
  instanceId,
  layoutType,
}: {
  children: ReactNode;
  instanceId: string;
  layoutType?: PageLayoutType;
}) => {
  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
    instanceId,
  );

  const resolvedLayoutType =
    layoutType ?? pageLayoutPersisted?.type ?? PageLayoutType.DASHBOARD;

  return (
    <PageLayoutEditModeProvider
      layoutType={resolvedLayoutType}
      pageLayoutId={instanceId}
    >
      {children}
    </PageLayoutEditModeProvider>
  );
};

export const PageLayoutTestWrapper = ({
  children,
  instanceId: instanceIdFromProps,
  store: storeFromProps,
  layoutType,
}: {
  children: ReactNode;
  instanceId?: string;
  store?: ReturnType<typeof getDefaultStore>;
  layoutType?: PageLayoutType;
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
          <PageLayoutTestEditModeProvider
            instanceId={instanceId}
            layoutType={layoutType}
          >
            {children}
          </PageLayoutTestEditModeProvider>
        </TabListComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};
