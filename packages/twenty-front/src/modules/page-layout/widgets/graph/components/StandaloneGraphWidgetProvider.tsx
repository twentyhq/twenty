import { type ReactNode } from 'react';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';

type StandaloneGraphWidgetProviderProps = {
  instanceId: string;
  children: ReactNode;
};

// Lets a graph widget render outside a page layout, which normally scopes its hover and tooltip state
export const StandaloneGraphWidgetProvider = ({
  instanceId,
  children,
}: StandaloneGraphWidgetProviderProps) => (
  <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
    <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
      <WidgetComponentInstanceContext.Provider value={{ instanceId }}>
        {children}
      </WidgetComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  </PageLayoutEditModeProviderContext>
);
