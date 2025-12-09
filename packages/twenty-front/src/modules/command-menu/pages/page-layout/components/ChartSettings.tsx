import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartSettingItem } from '@/command-menu/pages/page-layout/components/chart-settings/ChartSettingItem';
import { ChartLimitInfoBanner } from '@/command-menu/pages/page-layout/components/ChartLimitInfoBanner';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { CHART_SETTINGS_HEADINGS } from '@/command-menu/pages/page-layout/constants/ChartSettingsHeadings';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useGetConfigToUpdateAfterGraphTypeChange } from '@/command-menu/pages/page-layout/hooks/useUpdateGraphTypeConfig';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { shouldHideChartSetting } from '@/command-menu/pages/page-layout/utils/shouldHideChartSetting';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { GraphType } from '~/generated/graphql';

const StyledCommandMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const ChartSettings = ({ widget }: { widget: PageLayoutWidget }) => {
  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
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
            objectMetadataItems,
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
                objectMetadataItems,
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
              {visibleItems.map((item) => (
                <ChartSettingItem
                  key={item.id}
                  item={item}
                  objectMetadataId={widget.objectMetadataId}
                  configuration={configuration}
                />
              ))}
            </CommandGroup>
          );
        })}
      </CommandMenuList>
    </StyledCommandMenuContainer>
  );
};
