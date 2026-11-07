import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isChartConfigurationMissingRequiredFields } from '@/page-layout/utils/isChartConfigurationMissingRequiredFields';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// Only new or edited charts, like the server: a chart saved incomplete before must not block unrelated saves
export const findChartWidgetsMissingRequiredFields = ({
  pageLayoutDraft,
  persistedPageLayout,
}: {
  pageLayoutDraft: DraftPageLayout;
  persistedPageLayout: Pick<PageLayout, 'tabs'> | undefined;
}): PageLayoutWidget[] => {
  const persistedConfigurationByWidgetId = new Map(
    (persistedPageLayout?.tabs ?? [])
      .flatMap((tab) => tab.widgets)
      .map((widget) => [widget.id, widget.configuration]),
  );

  return pageLayoutDraft.tabs
    .filter((tab) => tab.isActive)
    .flatMap((tab) => tab.widgets)
    .filter(
      (widget) =>
        !isDeeplyEqual(
          widget.configuration,
          persistedConfigurationByWidgetId.get(widget.id),
        ) &&
        isWidgetConfigurationOfTypeGraph(widget.configuration) &&
        isChartConfigurationMissingRequiredFields(widget.configuration),
    );
};
