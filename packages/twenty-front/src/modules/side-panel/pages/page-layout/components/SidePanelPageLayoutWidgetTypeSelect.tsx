import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { FIND_MANY_FRONT_COMPONENTS } from '@/front-components/graphql/queries/findManyFrontComponents';
import { useCreatePageLayoutFrontComponentWidget } from '@/page-layout/hooks/useCreatePageLayoutFrontComponentWidget';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { useCreatePageLayoutIframeWidget } from '@/page-layout/hooks/useCreatePageLayoutIframeWidget';
import { useCreatePageLayoutRecordTableWidget } from '@/page-layout/hooks/useCreatePageLayoutRecordTableWidget';
import { useCreatePageLayoutStandaloneRichTextWidget } from '@/page-layout/hooks/useCreatePageLayoutStandaloneRichTextWidget';
import { useOpportunityDefaultChartConfig } from '@/page-layout/hooks/useOpportunityDefaultChartConfig';
import { useRemovePageLayoutWidgetAndPreservePosition } from '@/page-layout/hooks/useRemovePageLayoutWidgetAndPreservePosition';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { getFrontComponentWidgetTypeSelectItemId } from '@/side-panel/pages/page-layout/utils/getFrontComponentWidgetTypeSelectItemId';
import { isExistingWidgetMissingOrDifferentType } from '@/side-panel/pages/page-layout/utils/isExistingWidgetMissingOrDifferentType';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlignBoxLeftTop,
  IconApps,
  IconChartPie,
  IconFrame,
  IconTable,
} from 'twenty-ui/display';
import {
  FeatureFlagKey,
  type FrontComponent,
  WidgetType,
} from '~/generated-metadata/graphql';

export const SidePanelPageLayoutWidgetTypeSelect = () => {
  const { pageLayoutId, recordId } = usePageLayoutIdFromContextStore();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const { buildBarChartFieldSelection } = useOpportunityDefaultChartConfig();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: pageLayoutDraft.type,
    targetRecordIdentifier: { id: recordId, targetObjectNameSingular: '' },
  });

  const { createPageLayoutGraphWidget } = useCreatePageLayoutGraphWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const { createPageLayoutIframeWidget } = useCreatePageLayoutIframeWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const { createPageLayoutStandaloneRichTextWidget } =
    useCreatePageLayoutStandaloneRichTextWidget({
      pageLayoutId,
      tabListInstanceId,
    });

  const { createPageLayoutFrontComponentWidget } =
    useCreatePageLayoutFrontComponentWidget({
      pageLayoutId,
      tabListInstanceId,
    });

  const { createPageLayoutRecordTableWidget } =
    useCreatePageLayoutRecordTableWidget(pageLayoutId);

  const { removePageLayoutWidgetAndPreservePosition } =
    useRemovePageLayoutWidgetAndPreservePosition(pageLayoutId);

  const isApplicationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APPLICATION_ENABLED,
  );

  const isRecordTableWidgetEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_TABLE_WIDGET_ENABLED,
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
    useAtomComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const existingWidget = isDefined(pageLayoutEditingWidgetId)
    ? pageLayoutDraft.tabs
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

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutGraphTypeSelect,
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

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutIframeSettings,
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

    closeSidePanelMenu();
  };

  const handleNavigateToRecordTableSettings = () => {
    if (
      isExistingWidgetMissingOrDifferentType(
        existingWidget?.type,
        WidgetType.RECORD_TABLE,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const newRecordTableWidget = createPageLayoutRecordTableWidget();

      setPageLayoutEditingWidgetId(newRecordTableWidget.id);
    }

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutRecordTableSettings,
      focusTitleInput: false,
    });
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

    closeSidePanelMenu();
  };

  const selectableItemIds = [
    'chart',
    ...(isRecordTableWidgetEnabled ? ['record-table'] : []),
    'iframe',
    'rich-text',
    ...frontComponentsWithSelectItemId.map(({ selectItemId }) => selectItemId),
  ];

  return (
    <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Widget type`}>
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
        {isRecordTableWidgetEnabled && (
          <SelectableListItem
            itemId="record-table"
            onEnter={handleNavigateToRecordTableSettings}
          >
            <CommandMenuItem
              Icon={IconTable}
              label={t`Record Table`}
              id="record-table"
              onClick={handleNavigateToRecordTableSettings}
            />
          </SelectableListItem>
        )}
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
      </SidePanelGroup>

      {isApplicationEnabled && frontComponentsWithSelectItemId.length > 0 && (
        <SidePanelGroup heading={t`Front Components`}>
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
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
