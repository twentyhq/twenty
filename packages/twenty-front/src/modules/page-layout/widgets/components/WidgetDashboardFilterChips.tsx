import { useDashboardFilterForWidget } from '@/page-layout/hooks/useDashboardFilterForWidget';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { useGetPageLayoutFilterValueLabel } from '@/page-layout/hooks/useGetPageLayoutFilterValueLabel';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLingui } from '@lingui/react/macro';
import { IconFilter } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

const DASHBOARD_FILTER_CHIP_MAX_WIDTH = 160;

type WidgetDashboardFilterChipsProps = {
  widget: PageLayoutWidget;
};

export const WidgetDashboardFilterChips = ({
  widget,
}: WidgetDashboardFilterChipsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const dashboardFilters = useDashboardFilters();
  const { getValueLabel } = useGetPageLayoutFilterValueLabel();
  const { boundDashboardFilterValues } = useDashboardFilterForWidget(widget);

  const boundPageLayoutFilterIds = new Set(
    boundDashboardFilterValues.map(
      ({ pageLayoutFilterId }) => pageLayoutFilterId,
    ),
  );

  return dashboardFilters?.pageLayoutFilters
    .filter(({ id }) => boundPageLayoutFilterIds.has(id))
    .map(({ id, label }) => {
      const valueLabel = getValueLabel(
        dashboardFilters.valueByPageLayoutFilterId[id],
      );

      return (
        <Chip
          key={id}
          variant="soft"
          maxWidth={DASHBOARD_FILTER_CHIP_MAX_WIDTH}
          startElement={<IconFilter size={theme.icon.size.sm} />}
        >
          {t`${label}: ${valueLabel}`}
        </Chip>
      );
    });
};
