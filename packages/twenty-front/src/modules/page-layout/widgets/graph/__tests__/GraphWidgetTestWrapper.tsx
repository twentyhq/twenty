import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { type ReactNode } from 'react';
import { RecoilRoot, type MutableSnapshot } from 'recoil';

export const GRAPH_WIDGET_TEST_INSTANCE_ID =
  '30303030-f244-4ae0-906b-78958aa07642';

export const GraphWidgetTestWrapper = ({
  children,
  initializeState,
  instanceId: instanceIdFromProps,
}: {
  children: ReactNode;
  initializeState?: (snapshot: MutableSnapshot) => void;
  instanceId?: string;
}) => {
  const instanceId = instanceIdFromProps ?? GRAPH_WIDGET_TEST_INSTANCE_ID;

  return (
    <RecoilRoot initializeState={initializeState}>
      <GraphWidgetComponentInstanceContext.Provider value={{ instanceId }}>
        {children}
      </GraphWidgetComponentInstanceContext.Provider>
    </RecoilRoot>
  );
};
