import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartSettingItem } from '@/command-menu/pages/page-layout/components/chart-settings/ChartSettingItem';
import { ChartLimitInfoBanner } from '@/command-menu/pages/page-layout/components/ChartLimitInfoBanner';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { CHART_SETTINGS_HEADINGS } from '@/command-menu/pages/page-layout/constants/ChartSettingsHeadings';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateChartSettingInput } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingInput';
import { useUpdateChartSettingTextInput } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingTextInput';
import { useUpdateChartSettingToggle } from '@/command-menu/pages/page-layout/hooks/useUpdateChartSettingToggle';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useGetConfigToUpdateAfterGraphTypeChange } from '@/command-menu/pages/page-layout/hooks/useUpdateGraphTypeConfig';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { shouldHideChartSetting } from '@/command-menu/pages/page-layout/utils/shouldHideChartSetting';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import { GraphType, type PageLayoutWidget } from '~/generated/graphql';

const StyledCommandMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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

  const { updateChartSettingTextInput } =
    useUpdateChartSettingTextInput(pageLayoutId);

  const { getConfigToUpdateAfterGraphTypeChange } =
    useGetConfigToUpdateAfterGraphTypeChange({
      pageLayoutId,
      widget,
    });

  const isGroupByEnabled = getChartSettingsValues(
    CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
  );
  const [hasWidgetTooManyGroups, setHasWidgetTooManyGroups] =
    useRecoilComponentState(hasWidgetTooManyGroupsComponentState);

  const handleGraphTypeChange = (graphType: GraphType) => {
    const configToUpdate = getConfigToUpdateAfterGraphTypeChange(graphType);

    updateCurrentWidgetConfig({
      configToUpdate,
    });

    updateCommandMenuPageInfo({
      pageIcon: GRAPH_TYPE_INFORMATION[graphType].icon,
    });

    if (
      graphType !== GraphType.VERTICAL_BAR &&
      graphType !== GraphType.HORIZONTAL_BAR &&
      graphType !== GraphType.LINE
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

  const primaryAxisFieldMetadataId =
    configuration.__typename === 'BarChartConfiguration' ||
    configuration.__typename === 'LineChartConfiguration'
      ? configuration.primaryAxisGroupByFieldMetadataId
      : configuration.__typename === 'PieChartConfiguration'
        ? configuration.groupByFieldMetadataId
        : null;

  const primaryAxisField = objectMetadataItem?.fields?.find(
    (field) => field.id === primaryAxisFieldMetadataId,
  );

  const isPrimaryAxisDate = isFieldMetadataDateKind(primaryAxisField?.type);

  const primaryAxisDateGranularity =
    configuration.__typename === 'BarChartConfiguration' ||
    configuration.__typename === 'LineChartConfiguration'
      ? configuration.primaryAxisDateGranularity
      : configuration.__typename === 'PieChartConfiguration'
        ? configuration.dateGranularity
        : null;

  const bannerTargetHeading =
    currentGraphType === GraphType.PIE
      ? CHART_SETTINGS_HEADINGS.DATA
      : CHART_SETTINGS_HEADINGS.X_AXIS;

  return (
    <StyledCommandMenuContainer>
      <CommandMenuList commandGroups={[]} selectableItemIds={visibleItemIds}>
        <ChartTypeSelectionSection
          currentGraphType={currentGraphType}
          setCurrentGraphType={handleGraphTypeChange}
        />
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

          const shouldShowBanner = group.heading.id === bannerTargetHeading.id;

          return (
            <CommandGroup key={group.heading.id} heading={t(group.heading)}>
              {shouldShowBanner && hasWidgetTooManyGroups && (
                <ChartLimitInfoBanner
                  graphType={currentGraphType}
                  isPrimaryAxisDate={isPrimaryAxisDate}
                  primaryAxisDateGranularity={primaryAxisDateGranularity}
                />
              )}
              {visibleItems.map((item) => {
                const handleItemToggleChange = () => {
                  setSelectedItemId(item.id);
                  updateChartSettingToggle(item.id);
                };

                const handleItemInputChange = (value: number | null) => {
                  updateChartSettingInput(item.id, value);
                };

                const handleItemTextInputChange = (value: string) => {
                  updateChartSettingTextInput(item.id, value);
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
                    onTextInputChange={handleItemTextInputChange}
                    onDropdownOpen={handleItemDropdownOpen}
                    onFilterClick={handleFilterClick}
                  />
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandMenuList>
    </StyledCommandMenuContainer>
  );
};
