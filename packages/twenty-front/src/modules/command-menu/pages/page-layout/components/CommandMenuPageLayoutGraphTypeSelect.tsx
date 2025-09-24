import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GraphTypeInfo } from '@/command-menu/pages/page-layout/components/GraphTypeInfo';
import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import {
  IconArrowsSort,
  IconAxisX,
  IconAxisY,
  IconColorSwatch,
  IconDatabase,
  IconFilter,
  IconFilters,
  IconMathXy,
  IconTag,
} from 'twenty-ui/display';

export const CommandMenuPageLayoutGraphTypeSelect = () => {
  const [currentGraphType, setCurrentGraphType] = useState(GraphType.BAR);
  const theme = useTheme();

  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  const handleGraphTypeChange = (graphType: GraphType) => {
    setCurrentGraphType(graphType);
    updateCommandMenuPageInfo({
      pageIcon: GraphTypeInfo[graphType].icon,
    });
  };

  return (
    <>
      <SidePanelHeader
        Icon={GraphTypeInfo[currentGraphType].icon}
        iconColor={theme.font.color.tertiary}
        initialTitle="Chart"
        headerType={GraphTypeInfo[currentGraphType].label}
        onTitleChange={() => {}}
      />

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
        <CommandGroup heading="Data">
          <CommandMenuItem
            Icon={IconDatabase}
            label="Source"
            id="source"
            onClick={() => {}}
          />
          <CommandMenuItem
            Icon={IconFilter}
            label="Filter"
            id="filter"
            onClick={() => {}}
          />
        </CommandGroup>
        <CommandGroup heading="X axis">
          <CommandMenuItem
            Icon={IconAxisX}
            label="Data on display"
            id="data-on-display-x"
            onClick={() => {}}
          />
          <CommandMenuItem
            Icon={IconArrowsSort}
            label="Sort by"
            id="sort-by"
            onClick={() => {}}
          />
        </CommandGroup>
        <CommandGroup heading="Y axis">
          <CommandMenuItem
            Icon={IconAxisY}
            label="Data on display"
            id="data-on-display-y"
            onClick={() => {}}
          />
          <CommandMenuItem
            Icon={IconFilters}
            label="Group by"
            id="group-by-y"
            onClick={() => {}}
          />
        </CommandGroup>
        <CommandGroup heading="Style">
          <CommandMenuItem
            Icon={IconColorSwatch}
            label="Colors"
            id="colors"
            onClick={() => {}}
          />
          <CommandMenuItem
            Icon={IconMathXy}
            label="Axis name"
            id="axis-name"
            onClick={() => {}}
          />
          <CommandMenuItem
            Icon={IconTag}
            label="Data labels"
            id="data-labels"
            onClick={() => {}}
          />
        </CommandGroup>
      </CommandMenuList>
    </>
  );
};
