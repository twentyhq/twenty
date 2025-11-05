import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartSettingItem } from '@/command-menu/pages/page-layout/components/chart-settings/ChartSettingItem';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateChartSettingInput } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingInput';
import { useUpdateChartSettingToggle } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingToggle';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useUpdateGraphTypeConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateGraphTypeConfig';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { shouldHideChartSetting } from '@/command-menu/pages/page-layout/utils/shouldHideChartSetting';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMaximumNumberOfBars.constant';
import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { SidePanelInformationBanner } from 'twenty-ui/display';

import { GraphType, type PageLayoutWidget } from '~/generated/graphql';

const StyledSidePanelInformationBanner = styled(SidePanelInformationBanner)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

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
  const { objectMetadataItems } = useObjectMetadataItems();

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

  const { updateGraphTypeConfig } = useUpdateGraphTypeConfig({
    pageLayoutId,
    widget,
    configuration,
  });

  const isGroupByEnabled = getChartSettingsValues(
    CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
  );
  const [hasWidgetTooManyGroups, setHasWidgetTooManyGroups] =
    useRecoilComponentState(hasWidgetTooManyGroupsComponentState);

  const handleGraphTypeChange = (graphType: GraphType) => {
    const configToUpdate = updateGraphTypeConfig(graphType);

    updateCurrentWidgetConfig({
      configToUpdate,
    });

    updateCommandMenuPageInfo({
      pageIcon: GRAPH_TYPE_INFORMATION[graphType].icon,
    });

    if (
      graphType !== GraphType.VERTICAL_BAR &&
      graphType !== GraphType.HORIZONTAL_BAR
    ) {
      setHasWidgetTooManyGroups(false);
    }
  };

  const chartSettings = GRAPH_TYPE_INFORMATION[currentGraphType].settings;

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widget.objectMetadataId,
  );

  const visibleItemIds = chartSettings.flatMap((group) =>
    group.items
      .filter(
        (item) =>
          !shouldHideChartSetting(
            item,
            widget.objectMetadataId,
            isGroupByEnabled as boolean,
            configuration,
            objectMetadataItem,
          ),
      )
      .map((item) => item.id),
  );

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={visibleItemIds}>
      <ChartTypeSelectionSection
        currentGraphType={currentGraphType}
        setCurrentGraphType={handleGraphTypeChange}
      />
      {hasWidgetTooManyGroups && (
        <StyledSidePanelInformationBanner
          message={t`Max ${BAR_CHART_MAXIMUM_NUMBER_OF_BARS} bars per chart. Consider adding a filter`}
        />
      )}
      {chartSettings.map((group) => {
        const visibleItems = group.items.filter(
          (item) =>
            !shouldHideChartSetting(
              item,
              widget.objectMetadataId,
              isGroupByEnabled as boolean,
              configuration,
              objectMetadataItem,
            ),
        );

        return (
          <CommandGroup key={group.heading} heading={group.heading}>
            {visibleItems.map((item) => {
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
        );
      })}
    </CommandMenuList>
  );
};
