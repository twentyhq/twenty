import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuItemNumberInput } from '@/command-menu/components/CommandMenuItemNumberInput';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { isMinMaxRangeValid } from '@/command-menu/pages/page-layout/utils/isMinMaxRangeValid';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ChartSettingItemProps = {
  item: ChartSettingsItem;
  configuration: ChartConfiguration;
  getChartSettingsValues: (
    itemId: CHART_CONFIGURATION_SETTING_IDS,
  ) => boolean | string | undefined;
  onToggleChange: () => void;
  onInputChange: (value: number | null) => void;
  onDropdownOpen: () => void;
  onFilterClick: () => void;
};

export const ChartSettingItem = ({
  item,
  configuration,
  getChartSettingsValues,
  onToggleChange,
  onInputChange,
  onDropdownOpen,
  onFilterClick,
}: ChartSettingItemProps) => {
  if (item.id === CHART_CONFIGURATION_SETTING_IDS.FILTER) {
    return (
      <SelectableListItem
        key={item.id}
        itemId={item.id}
        onEnter={onFilterClick}
      >
        <CommandMenuItem
          id={item.id}
          label={t(item.label)}
          Icon={item.Icon}
          hasSubMenu
          onClick={onFilterClick}
        />
      </SelectableListItem>
    );
  }

  if (isDefined(item.isInput)) {
    const settingValue = getChartSettingsValues(item.id);
    const stringValue = isString(settingValue) ? settingValue : '';

    return (
      <SelectableListItem key={item.id} itemId={item.id}>
        <CommandMenuItem
          id={item.id}
          label={t(item.label)}
          Icon={item.Icon}
          RightComponent={
            <CommandMenuItemNumberInput
              value={stringValue}
              onChange={onInputChange}
              onValidate={(value) =>
                !isDefined(value) ||
                isMinMaxRangeValid(
                  item.id as
                    | CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE
                    | CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
                  value,
                  configuration,
                )
              }
              placeholder={
                item.inputPlaceholder ? t(item.inputPlaceholder) : undefined
              }
            />
          }
        />
      </SelectableListItem>
    );
  }

  if (item.isBoolean) {
    return (
      <SelectableListItem
        key={item.id}
        itemId={item.id}
        onEnter={onToggleChange}
      >
        <CommandMenuItemToggle
          LeftIcon={item.Icon}
          text={t(item.label)}
          id={item.id}
          toggled={getChartSettingsValues(item.id) as boolean}
          onToggleChange={onToggleChange}
        />
      </SelectableListItem>
    );
  }

  return (
    <SelectableListItem key={item.id} itemId={item.id} onEnter={onDropdownOpen}>
      <CommandMenuItemDropdown
        Icon={item.Icon}
        label={t(item.label)}
        id={item.id}
        dropdownId={item.id}
        dropdownComponents={
          <DropdownContent widthInPixels={item.dropdownWidth}>
            {item.DropdownContent && <item.DropdownContent />}
          </DropdownContent>
        }
        dropdownPlacement="bottom-end"
        description={getChartSettingsValues(item.id) as string}
        contextualTextPosition={'right'}
        hasSubMenu
      />
    </SelectableListItem>
  );
};
