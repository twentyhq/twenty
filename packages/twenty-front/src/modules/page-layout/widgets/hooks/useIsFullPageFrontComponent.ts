import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

export const useIsFullPageFrontComponent = (widgetType: WidgetType) => {
  const { presentation } = usePageLayoutContentContext();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  return (
    currentPageLayout.type === PageLayoutType.STANDALONE_PAGE &&
    presentation === 'solo' &&
    widgetType === WidgetType.FRONT_COMPONENT
  );
};
