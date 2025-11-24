import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { DashboardWidgetPlaceholder } from '@/page-layout/widgets/components/DashboardWidgetPlaceholder';
import { PageLayoutType } from '~/generated/graphql';

export const WidgetPlaceholder = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  if (currentPageLayout.type === PageLayoutType.DASHBOARD) {
    return <DashboardWidgetPlaceholder />;
  }

  // TODO: Implement RecordPageWidgetPlaceholder when needed
  return <DashboardWidgetPlaceholder />;
};
