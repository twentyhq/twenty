import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { type ReactNode } from 'react';

export const GRAPH_WIDGET_TEST_INSTANCE_ID =
  '30303030-f244-4ae0-906b-78958aa07642';

export const PAGE_LAYOUT_TEST_INSTANCE_ID =
  '20202020-f244-4ae0-906b-78958aa07642';

export const GraphWidgetTestWrapper = ({
  children,
  instanceId: instanceIdFromProps,
  pageLayoutInstanceId: pageLayoutInstanceIdFromProps,
}: {
  children: ReactNode;
  instanceId?: string;
  pageLayoutInstanceId?: string;
}) => {
  const instanceId = instanceIdFromProps ?? GRAPH_WIDGET_TEST_INSTANCE_ID;
  const pageLayoutInstanceId =
    pageLayoutInstanceIdFromProps ?? PAGE_LAYOUT_TEST_INSTANCE_ID;

  return (
    <PageLayoutComponentInstanceContext.Provider
      value={{ instanceId: pageLayoutInstanceId }}
    >
      <WidgetComponentInstanceContext.Provider value={{ instanceId }}>
        {children}
      </WidgetComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
