import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { ChartTypeSelectionSection } from '@/command-menu/pages/page-layout/components/ChartTypeSelectionSection';
import { GraphTypeInfo } from '@/command-menu/pages/page-layout/components/GraphTypeInfo';
import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  IconArrowsSort,
  IconAxisX,
  IconColorSwatch,
  IconDatabase,
  IconFilters,
  IconTag,
} from 'twenty-ui/display';

const StyledCommandMenuList = styled(CommandMenuList)`
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const CommandMenuPageLayoutGraphTypeSelect = () => {
  const [currentGraphType, setCurrentGraphType] = useState(GraphType.BAR);
  const theme = useTheme();

  return (
    <>
      <SidePanelHeader
        Icon={GraphTypeInfo[currentGraphType].icon}
        iconColor={theme.font.color.tertiary}
        initialTitle="Chart"
        headerType={GraphTypeInfo[currentGraphType].label}
        onTitleChange={() => {}}
      />

      <StyledCommandMenuList
        commandGroups={[]}
        selectableItemIds={[
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
          setCurrentGraphType={setCurrentGraphType}
        />
        <CommandGroup heading="X axis">
          <CommandMenuItem
            Icon={IconDatabase}
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
            Icon={IconDatabase}
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
            Icon={IconAxisX}
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
      </StyledCommandMenuList>
    </>
  );
};
