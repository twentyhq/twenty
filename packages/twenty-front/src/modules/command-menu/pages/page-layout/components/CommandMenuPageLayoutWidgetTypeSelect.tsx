import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { getFrontComponentWidgetTypeSelectItemId } from '@/command-menu/pages/page-layout/utils/getFrontComponentWidgetTypeSelectItemId';
import { isExistingWidgetMissingOrDifferentType } from '@/command-menu/pages/page-layout/utils/isExistingWidgetMissingOrDifferentType';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { FIND_MANY_FRONT_COMPONENTS } from '@/front-components/graphql/queries/findManyFrontComponents';
import { useCreatePageLayoutFrontComponentWidget } from '@/page-layout/hooks/useCreatePageLayoutFrontComponentWidget';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { useCreatePageLayoutIframeWidget } from '@/page-layout/hooks/useCreatePageLayoutIframeWidget';
import { useCreatePageLayoutStandaloneRichTextWidget } from '@/page-layout/hooks/useCreatePageLayoutStandaloneRichTextWidget';
import { useOpportunityDefaultChartConfig } from '@/page-layout/hooks/useOpportunityDefaultChartConfig';
import { useRemovePageLayoutWidgetAndPreservePosition } from '@/page-layout/hooks/useRemovePageLayoutWidgetAndPreservePosition';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlignBoxLeftTop,
  IconApps,
  IconChartPie,
  IconFrame,
} from 'twenty-ui/display';
import {
  FeatureFlagKey,
  type FrontComponent,
  WidgetType,
} from '~/generated-metadata/graphql';

export const CommandMenuPageLayoutWidgetTypeSelect = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { closeCommandMenu } = useCommandMenu();

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const { buildBarChartFieldSelection } = useOpportunityDefaultChartConfig();

  const { createPageLayoutGraphWidget } =
    useCreatePageLayoutGraphWidget(pageLayoutId);

  const { createPageLayoutIframeWidget } =
    useCreatePageLayoutIframeWidget(pageLayoutId);

  const { createPageLayoutStandaloneRichTextWidget } =
    useCreatePageLayoutStandaloneRichTextWidget(pageLayoutId);

  const { createPageLayoutFrontComponentWidget } =
    useCreatePageLayoutFrontComponentWidget(pageLayoutId);

  const { removePageLayoutWidgetAndPreservePosition } =
    useRemovePageLayoutWidgetAndPreservePosition(pageLayoutId);

  const isApplicationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APPLICATION_ENABLED,
  );

  const { data: frontComponentsData } = useQuery<{
    frontComponents: FrontComponent[];
  }>(FIND_MANY_FRONT_COMPONENTS, {
    skip: !isApplicationEnabled,
  });

  const frontComponents = frontComponentsData?.frontComponents ?? [];

  const frontComponentsWithSelectItemId = frontComponents.map(
    (frontComponent) => ({
      frontComponent,
      selectItemId: getFrontComponentWidgetTypeSelectItemId(frontComponent.id),
    }),
  );

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useRecoilComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const draftPageLayout = useRecoilComponentValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const existingWidget = isDefined(pageLayoutEditingWidgetId)
    ? draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId)
    : undefined;

  const handleNavigateToGraphTypeSelect = () => {
    if (
      isExistingWidgetMissingOrDifferentType(
        existingWidget?.type,
        WidgetType.GRAPH,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const fieldSelection = buildBarChartFieldSelection();
      const newWidget = createPageLayoutGraphWidget({ fieldSelection });
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
      focusTitleInput: true,
    });
  };

  const handleNavigateToIframeSettings = () => {
    if (
      isExistingWidgetMissingOrDifferentType(
        existingWidget?.type,
        WidgetType.IFRAME,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const newWidget = createPageLayoutIframeWidget(t`Untitled iFrame`, null);
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutIframeSettings,
      focusTitleInput: true,
    });
  };

  const handleNavigateToRichTextSettings = () => {
    if (
      isExistingWidgetMissingOrDifferentType(
        existingWidget?.type,
        WidgetType.STANDALONE_RICH_TEXT,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const newWidget = createPageLayoutStandaloneRichTextWidget({
        blocknote: '',
        markdown: null,
      });
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    closeCommandMenu();
  };

  const handleCreateFrontComponentWidget = (frontComponent: FrontComponent) => {
    if (
      isExistingWidgetMissingOrDifferentType(
        existingWidget?.type,
        WidgetType.FRONT_COMPONENT,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const newWidget = createPageLayoutFrontComponentWidget(
        frontComponent.name,
        frontComponent.id,
      );
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    closeCommandMenu();
  };

  const selectableItemIds = [
    'chart',
    'iframe',
    'rich-text',
    ...frontComponentsWithSelectItemId.map(({ selectItemId }) => selectItemId),
  ];

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
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

      {isApplicationEnabled && frontComponentsWithSelectItemId.length > 0 && (
        <CommandGroup heading={t`Front Components`}>
          {frontComponentsWithSelectItemId.map(
            ({ frontComponent, selectItemId }) => (
              <SelectableListItem
                key={frontComponent.id}
                itemId={selectItemId}
                onEnter={() => handleCreateFrontComponentWidget(frontComponent)}
              >
                <CommandMenuItem
                  Icon={IconApps}
                  label={frontComponent.name}
                  id={selectItemId}
                  onClick={() =>
                    handleCreateFrontComponentWidget(frontComponent)
                  }
                />
              </SelectableListItem>
            ),
          )}
        </CommandGroup>
      )}
    </CommandMenuList>
  );
};
