import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { useChartSettingsValues } from '@/command-menu/pages/page-layout/hooks/useChartSettingsValues';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { getChartSettingsDropdownContent } from '@/command-menu/pages/page-layout/utils/getChartSettingsDropdownContent';
import { type GraphType } from '@/page-layout/mocks/mockWidgets';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { type PageLayoutWidget } from '~/generated/graphql';

export const ChartSettings = ({ widget }: { widget: PageLayoutWidget }) => {
  const configuration = widget.configuration;

  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  const currentGraphType = widget.configuration.graphType as GraphType;

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { getChartSettingsValues } = useChartSettingsValues(configuration);

  const handleGraphTypeChange = (graphType: GraphType) => {
    updateCurrentWidgetConfig({
      graphType,
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
          {group.items.map((item) => (
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
              description={getChartSettingsValues(item.id)}
              contextualTextPosition={item.contextualTextPosition}
              hasSubMenu={item.hasSubMenu}
              isSubMenuOpened={item.isSubMenuOpened}
            />
          ))}
        </CommandGroup>
      ))}
    </CommandMenuList>
  );
};
