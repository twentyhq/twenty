import { PageLayoutEditModeProvider } from '@/page-layout/components/PageLayoutEditModeProvider';
import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';
import { PageLayoutRecordPageCustomizationSessionRegistrationEffect } from '@/page-layout/components/PageLayoutRecordPageCustomizationSessionRegistrationEffect';
import { PageLayoutRelationWidgetsSyncEffect } from '@/page-layout/components/PageLayoutRelationWidgetsSyncEffect';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { type ReactNode } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type PageLayoutSetupProps = {
  pageLayoutId: string;
  children: ReactNode;
};

export const PageLayoutSetup = ({
  pageLayoutId,
  children,
}: PageLayoutSetupProps) => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const featureFlags = useFeatureFlagsMap();
  const isRecordPageLayoutEditingEnabled =
    featureFlags[FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED];

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType,
    targetRecordIdentifier,
  });

  return (
    <PageLayoutComponentInstanceContext.Provider
      value={{
        instanceId: pageLayoutId,
      }}
    >
      <TabListComponentInstanceContext.Provider
        value={{
          instanceId: tabListInstanceId,
        }}
      >
        <PageLayoutEditModeProvider
          layoutType={layoutType}
          pageLayoutId={pageLayoutId}
        >
          <PageLayoutInitializationQueryEffect pageLayoutId={pageLayoutId} />
          <PageLayoutRecordPageCustomizationSessionRegistrationEffect />
          {!isRecordPageLayoutEditingEnabled && (
            <PageLayoutRelationWidgetsSyncEffect pageLayoutId={pageLayoutId} />
          )}
          {children}
        </PageLayoutEditModeProvider>
      </TabListComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
