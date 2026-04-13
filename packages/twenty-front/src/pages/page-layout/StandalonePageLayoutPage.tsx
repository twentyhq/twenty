import { useParams } from 'react-router-dom';

import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { MainContainerLayoutWithSidePanel } from '@/object-record/components/MainContainerLayoutWithSidePanel';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { StandalonePageHeader } from '~/pages/page-layout/StandalonePageHeader';

export const StandalonePageLayoutPage = () => {
  const { pageLayoutId } = useParams<{ pageLayoutId: string }>();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return (
    <PageContainer>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: pageLayoutId }}
        >
          <StandalonePageHeader pageLayoutId={pageLayoutId} />
          <LayoutRenderingProvider
            value={{
              targetRecordIdentifier: undefined,
              layoutType: PageLayoutType.STANDALONE_PAGE,
              isInSidePanel: false,
            }}
          >
            <MainContainerLayoutWithSidePanel>
              <PageLayoutRenderer pageLayoutId={pageLayoutId} />
            </MainContainerLayoutWithSidePanel>
          </LayoutRenderingProvider>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </PageContainer>
  );
};
