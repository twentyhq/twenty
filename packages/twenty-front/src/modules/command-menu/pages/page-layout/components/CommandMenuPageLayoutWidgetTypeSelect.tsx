import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCompanyDefaultChartConfig } from '@/page-layout/hooks/useCompanyDefaultChartConfig';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { useCreatePageLayoutIframeWidget } from '@/page-layout/hooks/useCreatePageLayoutIframeWidget';
import { useCreatePageLayoutStandaloneRichTextWidget } from '@/page-layout/hooks/useCreatePageLayoutStandaloneRichTextWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlignBoxLeftTop,
  IconChartPie,
  IconFrame,
} from 'twenty-ui/display';

export const CommandMenuPageLayoutWidgetTypeSelect = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { closeCommandMenu } = useCommandMenu();

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const { buildBarChartFieldSelection } = useCompanyDefaultChartConfig();

  const { createPageLayoutGraphWidget } =
    useCreatePageLayoutGraphWidget(pageLayoutId);

  const { createPageLayoutIframeWidget } =
    useCreatePageLayoutIframeWidget(pageLayoutId);

  const { createPageLayoutStandaloneRichTextWidget } =
    useCreatePageLayoutStandaloneRichTextWidget(pageLayoutId);

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useRecoilComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const handleNavigateToGraphTypeSelect = () => {
    if (!isDefined(pageLayoutEditingWidgetId)) {
      const fieldSelection = buildBarChartFieldSelection();
      const newWidget = createPageLayoutGraphWidget({
        fieldSelection,
      });

      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
      focusTitleInput: true,
    });
  };

  const handleNavigateToIframeSettings = () => {
    if (!isDefined(pageLayoutEditingWidgetId)) {
      const newWidget = createPageLayoutIframeWidget(t`Untitled iFrame`, null);

      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutIframeSettings,
      focusTitleInput: true,
    });
  };

  const handleNavigateToRichTextSettings = () => {
    if (!isDefined(pageLayoutEditingWidgetId)) {
      const newWidget = createPageLayoutStandaloneRichTextWidget({
        blocknote: '',
        markdown: null,
      });
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    closeCommandMenu();
  };

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={['chart', 'iframe', 'rich-text']}
    >
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

        <SelectableListItem
          itemId="rich-text"
          onEnter={handleNavigateToRichTextSettings}
        >
          <CommandMenuItem
            Icon={IconAlignBoxLeftTop}
            label={t`Rich Text`}
            id="rich-text"
            onClick={handleNavigateToRichTextSettings}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
