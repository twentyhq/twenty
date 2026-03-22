import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useUpdateSidePanelPageInfo } from '@/side-panel/hooks/useUpdateSidePanelPageInfo';
import { ChartSettingItem } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingItem';
import { ChartLimitInfoBanner } from '@/side-panel/pages/page-layout/components/ChartLimitInfoBanner';
import { ChartTypeSelectionSection } from '@/side-panel/pages/page-layout/components/ChartTypeSelectionSection';
import { CHART_SETTINGS_HEADINGS } from '@/side-panel/pages/page-layout/constants/ChartSettingsHeadings';
import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { useChartSettingsValues } from '@/side-panel/pages/page-layout/hooks/useChartSettingsValues';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useGetConfigToUpdateAfterGraphTypeChange } from '@/side-panel/pages/page-layout/hooks/useUpdateGraphTypeConfig';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { shouldHideChartSetting } from '@/side-panel/pages/page-layout/utils/shouldHideChartSetting';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { assertChartWidgetOrThrow } from '@/side-panel/pages/page-layout/utils/assertChartWidgetOrThrow';
import { getCurrentGraphTypeFromConfig } from '@/side-panel/pages/page-layout/utils/getCurrentGraphTypeFromConfig';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const ChartSettings = ({ widget }: { widget: PageLayoutWidget }) => {
  const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { objectMetadataItems } = useObjectMetadataItems();

  assertChartWidgetOrThrow(widget);

  const configuration = widget.configuration;

  const { getChartSettingsValues } = useChartSettingsValues({
    objectMetadataId: widget.objectMetadataId,
    configuration,
  });

  const { getConfigToUpdateAfterGraphTypeChange } =
    useGetConfigToUpdateAfterGraphTypeChange({
      pageLayoutId,
      widget,
    });

  const isGroupByEnabled = getChartSettingsValues(
    CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
  );
  const [hasWidgetTooManyGroups, setHasWidgetTooManyGroups] =
    useAtomComponentState(hasWidgetTooManyGroupsComponentState);

  const handleGraphTypeChange = (graphType: GraphType) => {
    const configToUpdate = getConfigToUpdateAfterGraphTypeChange(graphType);

    updateCurrentWidgetConfig({
      configToUpdate,
    });

    updateSidePanelPageInfo({
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

  const currentGraphType = getCurrentGraphTypeFromConfig(configuration);

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
            objectMetadataItems,
          ),
      )
      .map((item) => item.id),
  );

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );

  const primaryAxisFieldMetadataId = isBarOrLineChart
    ? configuration.primaryAxisGroupByFieldMetadataId
    : isPieChart
      ? configuration.groupByFieldMetadataId
      : null;

  const primaryAxisField = objectMetadataItem?.fields?.find(
    (field) => field.id === primaryAxisFieldMetadataId,
  );

  const isPrimaryAxisDate = isFieldMetadataDateKind(primaryAxisField?.type);

  const primaryAxisDateGranularity = isBarOrLineChart
    ? configuration.primaryAxisDateGranularity
    : isPieChart
      ? configuration.dateGranularity
      : null;

  const bannerTargetHeading =
    currentGraphType === GraphType.PIE
      ? CHART_SETTINGS_HEADINGS.DATA
      : CHART_SETTINGS_HEADINGS.X_AXIS;

  return (
    <StyledSidePanelContainer>
      <SidePanelList commandGroups={[]} selectableItemIds={visibleItemIds}>
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
                objectMetadataItems,
              ),
          );

          const shouldShowBanner = group.heading.id === bannerTargetHeading.id;

          return (
            <SidePanelGroup key={group.heading.id} heading={t(group.heading)}>
              {shouldShowBanner && hasWidgetTooManyGroups && (
                <ChartLimitInfoBanner
                  widgetConfigurationType={configuration.configurationType}
                  isPrimaryAxisDate={isPrimaryAxisDate}
                  primaryAxisDateGranularity={primaryAxisDateGranularity}
                />
              )}
              {visibleItems.map((item) => (
                <ChartSettingItem
                  key={item.id}
                  item={item}
                  objectMetadataId={widget.objectMetadataId}
                  configuration={configuration}
                />
              ))}
            </SidePanelGroup>
          );
        })}
      </SidePanelList>
    </StyledSidePanelContainer>
  );
};
