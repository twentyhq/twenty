import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChartPie, IconFrame } from 'twenty-ui/display';
import { GraphType } from '~/generated-metadata/graphql';
import { WidgetType } from '~/generated/graphql';

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

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={['chart', 'iframe']}>
      <CommandGroup heading={t`Widget type`}>
        <CommandMenuItem
          Icon={IconChartPie}
          label={t`Chart`}
          id="chart"
          onClick={() => {
            if (!isDefined(pageLayoutEditingWidgetId)) {
              const newWidget = createPageLayoutGraphWidget(
                WidgetType.GRAPH,
                GraphType.BAR,
              );

              setPageLayoutEditingWidgetId(newWidget.id);
            }

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
