import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuItemNumberInput } from '@/command-menu/components/CommandMenuItemNumberInput';
import { CommandMenuItemTextInput } from '@/command-menu/components/CommandMenuItemTextInput';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateChartSettingInput } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingInput';
import { useUpdateChartSettingTextInput } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingTextInput';
import { useUpdateChartSettingToggle } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingToggle';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { isMinMaxRangeValid } from '@/command-menu/pages/page-layout/utils/isMinMaxRangeValid';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { openDropdown } = useOpenDropdown();
  const { setSelectedItemId } = useSelectableList(
    COMMAND_MENU_LIST_SELECTABLE_LIST_ID,
  );
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

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

  const handleToggleChange = () => {
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
    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutGraphFilter,
    });
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
        onEnter={handleToggleChange}
      >
        <CommandMenuItemToggle
          LeftIcon={item.Icon}
          text={t(item.label)}
          id={item.id}
          toggled={getChartSettingsValues(item.id) as boolean}
          onToggleChange={handleToggleChange}
        />
      </SelectableListItem>
    );
  }

  return (
    <SelectableListItem
      key={item.id}
      itemId={item.id}
      onEnter={handleDropdownOpen}
    >
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
