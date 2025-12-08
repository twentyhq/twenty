import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';
import { RecoilRoot, type MutableSnapshot } from 'recoil';
import { messages as enMessages } from '~/locales/generated/en';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

i18n.load({
  [SOURCE_LOCALE]: enMessages,
});
i18n.activate(SOURCE_LOCALE);

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
    <I18nProvider i18n={i18n}>
      <RecoilRoot initializeState={initializeState}>
        <GraphWidgetComponentInstanceContext.Provider value={{ instanceId }}>
          {children}
        </GraphWidgetComponentInstanceContext.Provider>
      </RecoilRoot>
    </I18nProvider>
  );
};
