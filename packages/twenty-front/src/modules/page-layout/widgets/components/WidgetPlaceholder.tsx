import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { DashboardWidgetPlaceholder } from '@/page-layout/widgets/components/DashboardWidgetPlaceholder';
import { StandaloneWidgetPlaceholder } from '@/page-layout/widgets/components/StandaloneWidgetPlaceholder';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const WidgetPlaceholder = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  if (currentPageLayout.type === PageLayoutType.DASHBOARD) {
    return <DashboardWidgetPlaceholder />;
  }

  if (currentPageLayout.type === PageLayoutType.STANDALONE_PAGE) {
    return <StandaloneWidgetPlaceholder />;
  }

  // TODO: Implement RecordPageWidgetPlaceholder when needed
  return <DashboardWidgetPlaceholder />;
};
