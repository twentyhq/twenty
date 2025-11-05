import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCompanyDefaultChartConfig } from '@/page-layout/hooks/useCompanyDefaultChartConfig';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { useCreatePageLayoutIframeWidget } from '@/page-layout/hooks/useCreatePageLayoutIframeWidget';
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

  const { buildBarChartFieldSelection } = useCompanyDefaultChartConfig();

  const { createPageLayoutGraphWidget } =
    useCreatePageLayoutGraphWidget(pageLayoutId);

  const { createPageLayoutIframeWidget } =
    useCreatePageLayoutIframeWidget(pageLayoutId);

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useRecoilComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const handleNavigateToGraphTypeSelect = () => {
    if (!isDefined(pageLayoutEditingWidgetId)) {
      const fieldSelection = buildBarChartFieldSelection();
      const newWidget = createPageLayoutGraphWidget({
        graphType: GraphType.VERTICAL_BAR,
        fieldSelection,
      });

      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
    });
  };

  const handleNavigateToIframeSettings = () => {
    if (!isDefined(pageLayoutEditingWidgetId)) {
      const newWidget = createPageLayoutIframeWidget('Untitled iFrame', null);

      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutIframeSettings,
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
          onEnter={handleNavigateToIframeSettings}
        >
          <CommandMenuItem
            Icon={IconFrame}
            label={t`iFrame`}
            id="iframe"
            onClick={handleNavigateToIframeSettings}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
