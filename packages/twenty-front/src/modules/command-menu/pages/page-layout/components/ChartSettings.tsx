import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { GRAPH_TYPE_TO_CONFIG_TYPENAME } from '@/command-menu/pages/page-layout/constants/GraphTypeToConfigTypename';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import {
  CHART_CONFIGURATION_SETTING_IDS,
  CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP,
} from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconFilter } from 'twenty-ui/display';

import {
  BarChartGroupMode,
  type GraphType,
  type PageLayoutWidget,
} from '~/generated/graphql';

export const ChartSettings = ({ widget }: { widget: PageLayoutWidget }) => {
  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  const { navigateCommandMenu } = useNavigateCommandMenu();

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { openDropdown } = useOpenDropdown();

  if (widget.configuration?.__typename === 'IframeConfiguration') {
    throw new Error(t`IframeConfiguration is not supported`);
  }

  const configuration = widget.configuration as ChartConfiguration;

  const { getChartSettingsValues } = useChartSettingsValues({
    objectMetadataId: widget.objectMetadataId,
    configuration,
  });

  const currentGraphType = configuration?.graphType;

  const handleGraphTypeChange = (graphType: GraphType) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        __typename: GRAPH_TYPE_TO_CONFIG_TYPENAME[graphType],
        graphType,
      },
    });

    updateCommandMenuPageInfo({
      pageIcon: GRAPH_TYPE_INFORMATION[graphType].icon,
    });
  };

  const chartSettings = GRAPH_TYPE_INFORMATION[currentGraphType].settings;

  const { setSelectedItemId } = useSelectableList(
    COMMAND_MENU_LIST_SELECTABLE_LIST_ID,
  );

  const isGroupByEnabled = getChartSettingsValues(
    CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
  );

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={[
        ...chartSettings.flatMap((group) => group.items.map((item) => item.id)),
      ]}
    >
      <ChartTypeSelectionSection
        currentGraphType={currentGraphType}
        setCurrentGraphType={handleGraphTypeChange}
      />
      {chartSettings.map((group) => (
        <CommandGroup key={group.heading} heading={group.heading}>
          {group.items.map((item) => {
            const isDisabled =
              (!isNonEmptyString(widget.objectMetadataId) &&
                (item?.dependsOn?.includes(
                  CHART_CONFIGURATION_SETTING_IDS.SOURCE,
                ) ??
                  false)) ||
              (!isGroupByEnabled &&
                item?.dependsOn?.includes(
                  CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
                ));

            const handleToggleChange = () => {
              const configKey =
                item.id in CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP
                  ? CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP[
                      item.id as keyof typeof CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP
                    ]
                  : item.id;

              setSelectedItemId(item.id);

              if (item.id === CHART_CONFIGURATION_SETTING_IDS.STACKED_BARS) {
                const isCurrentlyStacked = getChartSettingsValues(item.id);
                const newGroupMode = isCurrentlyStacked
                  ? BarChartGroupMode.GROUPED
                  : BarChartGroupMode.STACKED;

                updateCurrentWidgetConfig({
                  configToUpdate: {
                    groupMode: newGroupMode,
                  },
                });
              } else {
                const newValue = !getChartSettingsValues(item.id);

                updateCurrentWidgetConfig({
                  configToUpdate: {
                    [configKey]: newValue,
                  },
                });
              }
            };

            const handleDropdownOpen = () => {
              openDropdown({
                dropdownComponentInstanceIdFromProps: item.id,
              });
            };

            const handleFilterSettingsClick = () => {
              navigateCommandMenu({
                page: CommandMenuPages.PageLayoutGraphFilter,
                pageTitle: t`Filters`,
                pageIcon: IconFilter,
              });
            };

            if (item.id === CHART_CONFIGURATION_SETTING_IDS.FILTER) {
              return (
                <SelectableListItem
                  key={item.id}
                  itemId={item.id}
                  onEnter={handleFilterSettingsClick}
                >
                  <CommandMenuItem
                    id={item.id}
                    label="Filter"
                    Icon={item.Icon}
                    hasSubMenu
                    onClick={handleFilterSettingsClick}
                  />
                </SelectableListItem>
              );
            }

            return item.isBoolean ? (
              <SelectableListItem
                key={item.id}
                itemId={item.id}
                onEnter={isDisabled ? undefined : handleToggleChange}
              >
                <CommandMenuItemToggle
                  LeftIcon={item.Icon}
                  text={t(item.label)}
                  id={item.id}
                  toggled={getChartSettingsValues(item.id) as boolean}
                  onToggleChange={handleToggleChange}
                />
              </SelectableListItem>
            ) : (
              <SelectableListItem
                key={item.id}
                itemId={item.id}
                onEnter={isDisabled ? undefined : handleDropdownOpen}
              >
                <CommandMenuItemDropdown
                  Icon={item.Icon}
                  label={t(item.label)}
                  id={item.id}
                  dropdownId={item.id}
                  dropdownComponents={
                    <DropdownContent>
                      {item.DropdownContent && <item.DropdownContent />}
                    </DropdownContent>
                  }
                  dropdownPlacement="bottom-end"
                  description={getChartSettingsValues(item.id) as string}
                  contextualTextPosition={'right'}
                  hasSubMenu
                  disabled={isDisabled}
                />
              </SelectableListItem>
            );
          })}
        </CommandGroup>
      ))}
    </CommandMenuList>
  );
};
