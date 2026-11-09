import { useGetPageLayoutFilterValueLabel } from '@/page-layout/hooks/useGetPageLayoutFilterValueLabel';
import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconFilterOff } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

type WidgetDashboardFilterChipsProps = {
  indicators: WidgetDashboardFilterIndicator[];
};

export const WidgetDashboardFilterChips = ({
  indicators,
}: WidgetDashboardFilterChipsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getValueLabel } = useGetPageLayoutFilterValueLabel();

  const getChipLabel = ({
    label,
    value,
    fieldLabel,
  }: WidgetDashboardFilterIndicator) => {
    if (!isDefined(fieldLabel)) {
      return t`Not filtered by ${label}`;
    }

    const valueLabel = getValueLabel(value);

    return t`${label} · ${fieldLabel}: ${valueLabel}`;
  };

  return indicators.map((indicator) => {
    const isNotFiltered = !isDefined(indicator.fieldLabel);
    const FilterIcon = isNotFiltered ? IconFilterOff : IconFilter;

    return (
      <Chip
        key={indicator.pageLayoutFilterId}
        variant={isNotFiltered ? 'plain' : 'soft'}
        color={isNotFiltered ? 'secondary' : 'primary'}
        startElement={<FilterIcon size={theme.icon.size.sm} />}
      >
        {getChipLabel(indicator)}
      </Chip>
    );
  });
};
