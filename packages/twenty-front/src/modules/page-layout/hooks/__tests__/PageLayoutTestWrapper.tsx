import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type ReactNode } from 'react';
import { RecoilRoot, type MutableSnapshot } from 'recoil';

const instanceId = '20202020-f244-4ae0-906b-78958aa07642';

export const PageLayoutTestWrapper = ({
  children,
  initializeState,
}: {
  children: ReactNode;
  initializeState?: (snapshot: MutableSnapshot) => void;
}) => (
  <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
    <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
  </PageLayoutComponentInstanceContext.Provider>
);

export const PAGE_LAYOUT_TEST_INSTANCE_ID = instanceId;
