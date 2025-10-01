import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChartPie, IconFrame } from 'twenty-ui/display';
import { GraphType } from '~/generated-metadata/graphql';

export const CommandMenuPageLayoutWidgetTypeSelect = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const { createPageLayoutGraphWidget } =
    useCreatePageLayoutGraphWidget(pageLayoutId);

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useRecoilComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const handleNavigateToGraphTypeSelect = () => {
    if (!isDefined(pageLayoutEditingWidgetId)) {
      const newWidget = createPageLayoutGraphWidget(GraphType.BAR);

      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
    });
  };

  const handleNavigateToIframeConfig = () => {
    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutIframeConfig,
    });
  };

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={['chart', 'iframe']}>
      <CommandGroup heading={t`Widget type`}>
        <SelectableListItem
          itemId="chart"
          onEnter={handleNavigateToGraphTypeSelect}
        >
          <CommandMenuItem
            Icon={IconChartPie}
            label={t`Chart`}
            id="chart"
            onClick={handleNavigateToGraphTypeSelect}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="iframe"
          onEnter={() => {
            handleNavigateToIframeConfig();
          }}
        >
          <CommandMenuItem
            Icon={IconFrame}
            label="iFrame"
            id="iframe"
            onClick={handleNavigateToIframeConfig}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
