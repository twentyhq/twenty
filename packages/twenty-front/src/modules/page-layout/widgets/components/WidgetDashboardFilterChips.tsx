import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useDashboardFilterForWidget } from '@/page-layout/hooks/useDashboardFilterForWidget';
import { useDashboardFilterValues } from '@/page-layout/hooks/useDashboardFilterValues';
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
  const { objectMetadataItems } = useObjectMetadataItems();
  const { getValueLabel } = useGetPageLayoutFilterValueLabel();
  const { pageLayoutFilters } = useDashboardFilterValues();

  const { boundDashboardFilterValues } = useDashboardFilterForWidget({
    objectMetadataItem: objectMetadataItems.find(
      ({ id }) => id === widget.objectMetadataId,
    ),
    configuration: widget.configuration,
  });

  return boundDashboardFilterValues.map(
    ({ pageLayoutFilterId, conditions }) => {
      const filterLabel =
        pageLayoutFilters.find(({ id }) => id === pageLayoutFilterId)?.label ??
        '';
      const valueLabel = getValueLabel({ conditions });

      return (
        <Chip
          key={pageLayoutFilterId}
          variant="soft"
          maxWidth={DASHBOARD_FILTER_CHIP_MAX_WIDTH}
          startElement={<IconFilter size={theme.icon.size.sm} />}
        >
          {t`${filterLabel}: ${valueLabel}`}
        </Chip>
      );
    },
  );
};
