import { useParams } from 'react-router-dom';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
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
      <StandalonePageHeader pageLayoutId={pageLayoutId} />
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <LayoutRenderingProvider
          value={{
            targetRecordIdentifier: undefined,
            layoutType: PageLayoutType.STANDALONE_PAGE,
            isInSidePanel: false,
          }}
        >
          <PageLayoutRenderer pageLayoutId={pageLayoutId} />
        </LayoutRenderingProvider>
      </ContextStoreComponentInstanceContext.Provider>
    </PageContainer>
  );
};
