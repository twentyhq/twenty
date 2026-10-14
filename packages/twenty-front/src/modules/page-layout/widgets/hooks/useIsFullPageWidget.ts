import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const useIsFullPageWidget = () => {
  const { presentation } = usePageLayoutContentContext();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  return (
    currentPageLayout.type === PageLayoutType.STANDALONE_PAGE &&
    presentation === 'solo'
  );
};
