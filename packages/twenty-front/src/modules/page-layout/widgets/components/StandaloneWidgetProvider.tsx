import { type ReactNode } from 'react';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { PageLayoutType } from '~/generated-metadata/graphql';

type StandaloneWidgetProviderProps = {
  instanceId: string;
  children: ReactNode;
};

// Lets widget cards and charts render outside a page layout, which normally scopes their header, hover and tooltip state
export const StandaloneWidgetProvider = ({
  instanceId,
  children,
}: StandaloneWidgetProviderProps) => (
  <LayoutRenderingProvider
    value={{
      targetRecordIdentifier: undefined,
      layoutType: PageLayoutType.STANDALONE_PAGE,
    }}
  >
    <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
      <PageLayoutComponentInstanceContext.Provider value={{ instanceId }}>
        <WidgetComponentInstanceContext.Provider value={{ instanceId }}>
          {children}
        </WidgetComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </PageLayoutEditModeProviderContext>
  </LayoutRenderingProvider>
);
