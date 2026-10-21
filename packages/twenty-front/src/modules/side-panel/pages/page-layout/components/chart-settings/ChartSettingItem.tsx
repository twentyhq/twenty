import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { CommandMenuItemNumberInput } from '@/command-menu/components/CommandMenuItemNumberInput';
import { CommandMenuItemTextInput } from '@/command-menu/components/CommandMenuItemTextInput';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { useChartSettingsValues } from '@/side-panel/pages/page-layout/hooks/useChartSettingsValues';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateChartSettingInput } from '@/side-panel/pages/page-layout/hooks/useUpdateChartSettingInput';
import { useUpdateChartSettingTextInput } from '@/side-panel/pages/page-layout/hooks/useUpdateChartSettingTextInput';
import { useUpdateChartSettingToggle } from '@/side-panel/pages/page-layout/hooks/useUpdateChartSettingToggle';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { isMinMaxRangeValid } from '@/side-panel/pages/page-layout/utils/isMinMaxRangeValid';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const CHART_SETTINGS_DROPDOWN_SIDE_OFFSET = 4;

type ChartSettingItemProps = {
  item: ChartSettingsItem;
  objectMetadataId: string;
  configuration: ChartConfiguration;
};

export const ChartSettingItem = ({
  item,
  objectMetadataId,
  configuration,
}: ChartSettingItemProps) => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { openDropdown } = useOpenDropdown();
  const { setSelectedItemId } = useSelectableList(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const { getChartSettingsValues } = useChartSettingsValues({
    objectMetadataId,
    configuration,
  });

  const { updateChartSettingToggle } = useUpdateChartSettingToggle({
    pageLayoutId,
    objectMetadataId,
    configuration,
  });

  const { updateChartSettingInput } = useUpdateChartSettingInput(pageLayoutId);

  const { updateChartSettingTextInput } =
    useUpdateChartSettingTextInput(pageLayoutId);

  const handleCheckedChange = () => {
    setSelectedItemId(item.id);
    updateChartSettingToggle(item.id);
  };

  const handleInputChange = (value: number | null) => {
    updateChartSettingInput(item.id, value);
  };

  const handleTextInputChange = (value: string) => {
    updateChartSettingTextInput(item.id, value);
  };

  const handleDropdownOpen = () => {
    openDropdown({
      dropdownComponentInstanceIdFromProps: item.id,
    });
  };

  const handleFilterClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutGraphFilter);
  };
  if (item.id === CHART_CONFIGURATION_SETTING_IDS.FILTER) {
    const filterValue = getChartSettingsValues(item.id);
    const filterDescription = isString(filterValue) ? filterValue : undefined;

    return (
      <SelectableListItem
        key={item.id}
        itemId={item.id}
        onEnter={handleFilterClick}
      >
        <CommandMenuItem
          id={item.id}
          label={t(item.label)}
          Icon={item.Icon}
          hasSubMenu
          onClick={handleFilterClick}
          description={filterDescription}
          contextualTextPosition="right"
        />
      </SelectableListItem>
    );
  }

  if (isDefined(item.isNumberInput)) {
    const settingValue = getChartSettingsValues(item.id);
    const stringValue = isString(settingValue) ? settingValue : '';

    return (
      <SelectableListItem key={item.id} itemId={item.id}>
        <CommandMenuItemNumberInput
          id={item.id}
          label={t(item.label)}
          Icon={item.Icon}
          value={stringValue}
          onChange={handleInputChange}
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
      </SelectableListItem>
    );
  }

  if (isDefined(item.isTextInput)) {
    const settingValue = getChartSettingsValues(item.id);
    const stringValue = isString(settingValue) ? settingValue : '';

    return (
      <SelectableListItem key={item.id} itemId={item.id}>
        <CommandMenuItemTextInput
          id={item.id}
          label={t(item.label)}
          Icon={item.Icon}
          value={stringValue}
          onChange={handleTextInputChange}
          placeholder={
            item.inputPlaceholder ? t(item.inputPlaceholder) : undefined
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
        onEnter={handleCheckedChange}
      >
        <CommandMenuItemSwitch
          LeftIcon={item.Icon}
          text={t(item.label)}
          id={item.id}
          checked={getChartSettingsValues(item.id) as boolean}
          onCheckedChange={handleCheckedChange}
        />
      </SelectableListItem>
    );
  }

  const settingValue = getChartSettingsValues(item.id);
  const settingDescription = isString(settingValue) ? settingValue : undefined;

  return (
    <SelectableListItem
      key={item.id}
      itemId={item.id}
      onEnter={handleDropdownOpen}
    >
      <DropdownRoot dropdownId={item.id} type="picker">
        <CommandMenuItemDropdownTrigger
          Icon={item.Icon}
          label={t(item.label)}
          id={item.id}
          description={settingDescription}
          contextualTextPosition="right"
        />
        <DropdownContent
          side="bottom"
          align="end"
          sideOffset={CHART_SETTINGS_DROPDOWN_SIDE_OFFSET}
          width={item.dropdownWidth}
          collisionPadding={{ left: 0, right: 0 }}
        >
          {item.DropdownContent && <item.DropdownContent />}
        </DropdownContent>
      </DropdownRoot>
    </SelectableListItem>
  );
};
