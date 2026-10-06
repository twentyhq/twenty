import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { isChartWidget } from '@/side-panel/pages/page-layout/utils/isChartWidget';

// Only charts carry dashboard filter bindings; every other widget is passed through untouched.
export const mapChartWidgetsInDraft = (
  draft: DraftPageLayout,
  mapChartWidget: (widget: ChartWidget) => ChartWidget,
): DraftPageLayout => ({
  ...draft,
  tabs: draft.tabs.map((tab) => ({
    ...tab,
    widgets: tab.widgets.map((widget) =>
      isChartWidget(widget) ? mapChartWidget(widget) : widget,
    ),
  })),
});
