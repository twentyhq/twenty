import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { type GraphType } from '@/page-layout/mocks/mockWidgets';

import { type PageLayoutWidget } from '~/generated/graphql';

export const ChartSettings = ({
  widget,
  currentGraphType,
  setCurrentGraphType,
}: {
  widget: PageLayoutWidget;
  currentGraphType: GraphType;
  setCurrentGraphType: (graphType: GraphType) => void;
}) => {
  const configuration = widget.configuration;

  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  const handleGraphTypeChange = (graphType: GraphType) => {
    setCurrentGraphType(graphType);
    updateCommandMenuPageInfo({
      pageIcon: GRAPH_TYPE_INFORMATION[graphType].icon,
    });
  };

  const getItemDescription = ({
    configuration,
    itemId,
  }: {
    configuration: any;
    itemId: string;
  }) => {
    const descriptionMap: Record<string, string> = {
      source: configuration?.source,
      filter: configuration?.filter,
      'data-on-display-x': configuration?.dataOnDisplayX,
      'sort-by': configuration?.sortBy,
      'data-on-display-y': configuration?.dataOnDisplayY,
      'group-by-y': configuration?.groupByY,
      colors: configuration?.colors,
      'axis-name': configuration?.axisName,
      'data-labels': configuration?.dataLabels,
    };

    return descriptionMap[itemId];
  };

  const chartSettings = GRAPH_TYPE_INFORMATION[currentGraphType].settings;

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={[
        'source',
        'filter',
        'data-on-display-x',
        'sort-by',
        'data-on-display-y',
        'group-by-y',
        'colors',
        'axis-name',
        'data-labels',
      ]}
    >
      <ChartTypeSelectionSection
        currentGraphType={currentGraphType}
        setCurrentGraphType={handleGraphTypeChange}
      />
      {chartSettings.map((group) => (
        <CommandGroup key={group.heading} heading={group.heading}>
          {group.items.map((item) => (
            <CommandMenuItem
              key={item.id}
              Icon={item.Icon}
              label={item.label}
              id={item.id}
              description={getItemDescription({
                configuration,
                itemId: item.id,
              })}
              contextualTextPosition={item.contextualTextPosition}
              hasSubMenu={item.hasSubMenu}
              isSubMenuOpened={item.isSubMenuOpened}
              onClick={item.onClick}
            />
          ))}
        </CommandGroup>
      ))}
    </CommandMenuList>
  );
};
