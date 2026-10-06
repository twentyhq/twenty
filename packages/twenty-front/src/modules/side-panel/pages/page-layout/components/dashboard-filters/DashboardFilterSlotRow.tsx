import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { countDashboardFilterSlotBoundCharts } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotBoundCharts';
import { getDashboardFilterChartCountLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterChartCountLabel';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { t } from '@lingui/core/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconFilter, IconTrash } from 'twenty-ui/icon';

type DashboardFilterSlotRowProps = {
  slot: DashboardFilterSlot;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
  onClick?: () => void;
  onRemove?: () => void;
};

export const DashboardFilterSlotRow = ({
  slot,
  bindingsByWidgetId,
  onClick,
  onRemove,
}: DashboardFilterSlotRowProps) => {
  const { boundChartCount, chartCount } = countDashboardFilterSlotBoundCharts({
    slotId: slot.id,
    bindingsByWidgetId,
  });

  return (
    <SelectableListItem itemId={slot.id} onEnter={onClick}>
      <CommandMenuItem
        id={slot.id}
        label={slot.label}
        Icon={IconFilter}
        description={getDashboardFilterChartCountLabel({
          boundChartCount,
          chartCount,
        })}
        contextualTextPosition="right"
        hasSubMenu={isDefined(onClick)}
        onClick={onClick}
        RightComponent={
          isDefined(onRemove) ? (
            <LightIconButton
              aria-label={t`Remove filter`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
            >
              <IconTrash />
            </LightIconButton>
          ) : undefined
        }
      />
    </SelectableListItem>
  );
};
