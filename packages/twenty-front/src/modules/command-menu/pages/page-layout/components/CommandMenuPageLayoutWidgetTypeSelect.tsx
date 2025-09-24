import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { IconChartPie, IconFrame } from 'twenty-ui/display';

export const CommandMenuPageLayoutWidgetTypeSelect = () => {
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={['chart', 'iframe']}>
      <CommandGroup heading="Widget type">
        <CommandMenuItem
          Icon={IconChartPie}
          label="Chart"
          id="chart"
          onClick={() => {
            navigatePageLayoutCommandMenu({
              commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
            });
          }}
        />
        <CommandMenuItem
          Icon={IconFrame}
          label="iFrame"
          id="iframe"
          onClick={() => {
            navigatePageLayoutCommandMenu({
              commandMenuPage: CommandMenuPages.PageLayoutIframeConfig,
            });
          }}
        />
      </CommandGroup>
    </CommandMenuList>
  );
};
