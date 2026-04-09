import { useParams } from 'react-router-dom';

import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const StandalonePageLayoutPage = () => {
  const { pageLayoutId } = useParams<{ pageLayoutId: string }>();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return (
    <PageContainer>
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: undefined,
          layoutType: PageLayoutType.STANDALONE_PAGE,
          isInSidePanel: false,
        }}
      >
        <PageLayoutRenderer pageLayoutId={pageLayoutId} />
      </LayoutRenderingProvider>
    </PageContainer>
  );
};
