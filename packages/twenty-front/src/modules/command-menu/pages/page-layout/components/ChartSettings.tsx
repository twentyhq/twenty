import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartSettingItem } from '@/command-menu/pages/page-layout/components/chart-settings/ChartSettingItem';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { GRAPH_TYPE_TO_CONFIG_TYPENAME } from '@/command-menu/pages/page-layout/constants/GraphTypeToConfigTypename';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateChartSettingInput } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingInput';
import { useUpdateChartSettingToggle } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingToggle';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { isChartSettingDisabled } from '@/command-menu/pages/page-layout/utils/isChartSettingDisabled';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { t } from '@lingui/core/macro';

import { type GraphType, type PageLayoutWidget } from '~/generated/graphql';

export const ChartSettings = ({ widget }: { widget: PageLayoutWidget }) => {
  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { openDropdown } = useOpenDropdown();
  const { setSelectedItemId } = useSelectableList(
    COMMAND_MENU_LIST_SELECTABLE_LIST_ID,
  );

  if (widget.configuration?.__typename === 'IframeConfiguration') {
    throw new Error(t`IframeConfiguration is not supported`);
  }

  const configuration = widget.configuration as ChartConfiguration;
  const currentGraphType = configuration?.graphType;

  const { getChartSettingsValues } = useChartSettingsValues({
    objectMetadataId: widget.objectMetadataId,
    configuration,
  });

  const { updateChartSettingToggle } = useUpdateChartSettingToggle({
    pageLayoutId,
    objectMetadataId: widget.objectMetadataId,
    configuration,
  });

  const { updateChartSettingInput } = useUpdateChartSettingInput(pageLayoutId);

  const isGroupByEnabled = getChartSettingsValues(
    CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
  );

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
            const isDisabled = isChartSettingDisabled(
              item,
              widget.objectMetadataId,
              isGroupByEnabled as boolean,
            );

            const handleItemToggleChange = () => {
              setSelectedItemId(item.id);
              updateChartSettingToggle(item.id);
            };

            const handleItemInputChange = (value: number | null) => {
              updateChartSettingInput(item.id, value);
            };

            const handleItemDropdownOpen = () => {
              openDropdown({
                dropdownComponentInstanceIdFromProps: item.id,
              });
            };

            const handleFilterClick = () => {
              navigatePageLayoutCommandMenu({
                commandMenuPage: CommandMenuPages.PageLayoutGraphFilter,
              });
            };

            return (
              <ChartSettingItem
                key={item.id}
                item={item}
                isDisabled={isDisabled}
                configuration={configuration}
                getChartSettingsValues={getChartSettingsValues}
                onToggleChange={handleItemToggleChange}
                onInputChange={handleItemInputChange}
                onDropdownOpen={handleItemDropdownOpen}
                onFilterClick={handleFilterClick}
              />
            );
          })}
        </CommandGroup>
      ))}
    </CommandMenuList>
  );
};
