import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isChartConfigurationMissingRequiredFields } from '@/page-layout/utils/isChartConfigurationMissingRequiredFields';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';

export const findChartWidgetsMissingRequiredFields = (
  pageLayoutDraft: DraftPageLayout,
): PageLayoutWidget[] =>
  pageLayoutDraft.tabs
    .filter((tab) => tab.isActive)
    .flatMap((tab) => tab.widgets)
    .filter(
      (widget) =>
        isWidgetConfigurationOfTypeGraph(widget.configuration) &&
        isChartConfigurationMissingRequiredFields(widget.configuration),
    );
