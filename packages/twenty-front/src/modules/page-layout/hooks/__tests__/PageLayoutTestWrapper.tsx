import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type ReactNode } from 'react';
import { RecoilRoot, type MutableSnapshot } from 'recoil';

export const PAGE_LAYOUT_TEST_INSTANCE_ID =
  '20202020-f244-4ae0-906b-78958aa07642';

export const PageLayoutTestWrapper = ({
  children,
  initializeState,
  instanceId: instanceIdFromProps,
}: {
  children: ReactNode;
  initializeState?: (snapshot: MutableSnapshot) => void;
  instanceId?: string;
}) => {
  const instanceId = instanceIdFromProps ?? PAGE_LAYOUT_TEST_INSTANCE_ID;

  return (
    <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
      <TabListComponentInstanceContext.Provider
        value={{
          instanceId: getTabListInstanceIdFromPageLayoutId(instanceId),
        }}
      >
        <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
      </TabListComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
