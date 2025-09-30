import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { getChartSettingsDropdownContent } from '@/command-menu/pages/page-layout/utils/getChartSettingsDropdownContent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { type GraphType, type PageLayoutWidget } from '~/generated/graphql';

export const ChartSettings = ({ widget }: { widget: PageLayoutWidget }) => {
  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  if (widget.configuration?.__typename === 'IframeConfiguration') {
    throw new Error('IframeConfiguration is not supported');
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
          {group.items.map((item) =>
            item.isBoolean ? (
              <CommandMenuItemToggle
                key={item.id}
                LeftIcon={item.Icon}
                text={item.label}
                id={item.id}
                toggled={getChartSettingsValues(item.id) as boolean}
                onToggleChange={() => {
                  updateCurrentWidgetConfig({
                    [item.id === 'data-labels' ? 'dataLabels' : item.id]:
                      !getChartSettingsValues(item.id),
                  });
                }}
              />
            ) : (
              <CommandMenuItemDropdown
                key={item.id}
                Icon={item.Icon}
                label={item.label}
                id={item.id}
                dropdownId={item.id}
                dropdownComponents={
                  <DropdownContent>
                    <DropdownMenuItemsContainer>
                      {getChartSettingsDropdownContent(item.id)}
                    </DropdownMenuItemsContainer>
                  </DropdownContent>
                }
                dropdownPlacement="bottom-end"
                description={getChartSettingsValues(item.id) as string}
                contextualTextPosition={'right'}
                hasSubMenu
              />
            ),
          )}
        </CommandGroup>
      ))}
    </CommandMenuList>
  );
};
