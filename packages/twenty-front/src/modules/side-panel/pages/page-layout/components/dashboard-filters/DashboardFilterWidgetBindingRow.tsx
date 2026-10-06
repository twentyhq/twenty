import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';
import { DashboardFilterWidgetBindingDropdownContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterWidgetBindingDropdownContent';
import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { t } from '@lingui/core/macro';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChartBar } from 'twenty-ui/icon';

type DashboardFilterWidgetBindingRowProps = {
  slot: DashboardFilterSlot;
  widget: ChartWidget;
  binding: DashboardFilterBinding | null;
  onBindingChange: (binding: DashboardFilterBinding | null) => void;
};

export const DashboardFilterWidgetBindingRow = ({
  slot,
  widget,
  binding,
  onBindingChange,
}: DashboardFilterWidgetBindingRowProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const bindingLabel = isDefined(binding)
    ? getDashboardFilterBindingLabel({ binding, objectMetadataItems })
    : undefined;

  const dropdownId = `dashboard-filter-binding-${slot.id}-${widget.id}`;

  return (
    <SelectableListItem itemId={widget.id}>
      <CommandMenuItemDropdown
        id={widget.id}
        dropdownId={dropdownId}
        label={widget.title}
        Icon={IconChartBar}
        description={bindingLabel ?? t`Not applied`}
        contextualTextPosition="right"
        dropdownPlacement="bottom-end"
        dropdownOffset={{ y: 4 }}
        dropdownComponents={
          <LegacyDropdownContent
            widthInPixels={GenericDropdownContentWidth.ExtraLarge}
          >
            <DashboardFilterWidgetBindingDropdownContent
              slot={slot}
              widget={widget}
              binding={binding}
              onBindingChange={onBindingChange}
            />
          </LegacyDropdownContent>
        }
      />
    </SelectableListItem>
  );
};
