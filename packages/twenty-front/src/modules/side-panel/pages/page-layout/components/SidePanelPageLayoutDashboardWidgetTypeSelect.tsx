import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { FIND_MANY_FRONT_COMPONENTS } from '@/front-components/graphql/queries/findManyFrontComponents';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { useCreatePageLayoutWidget } from '@/page-layout/hooks/useCreatePageLayoutWidget';
import { useOpportunityDefaultChartConfig } from '@/page-layout/hooks/useOpportunityDefaultChartConfig';
import { useRemovePageLayoutWidgetAndPreservePosition } from '@/page-layout/hooks/useRemovePageLayoutWidgetAndPreservePosition';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { useAddDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget';
import { useRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutPickerOptions';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { GRAPH_TYPE_OPTIONS } from '@/side-panel/pages/page-layout/constants/GraphTypeOptions';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { type GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { getFrontComponentWidgetTypeSelectItemId } from '@/side-panel/pages/page-layout/utils/getFrontComponentWidgetTypeSelectItemId';
import { isExistingWidgetMissingOrDifferentType } from '@/side-panel/pages/page-layout/utils/isExistingWidgetMissingOrDifferentType';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import {
  StandardObjectNameSingular,
  SidePanelPages,
} from 'twenty-shared/types';
import {
  isDefined,
  isFrontComponentAvailableInWidgetPicker,
} from 'twenty-shared/utils';
import { IconAlignBoxLeftTop, IconApps, IconFrame } from 'twenty-ui/icon';
import {
  type FrontComponent,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const SidePanelPageLayoutDashboardWidgetTypeSelect = () => {
  const { t } = useLingui();
  const { pageLayoutId, targetRecordIdentifier } =
    usePageLayoutSidePanelTarget();

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
    targetRecordIdentifier,
  });

  const { createPageLayoutGraphWidget } = useCreatePageLayoutGraphWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const { createPageLayoutWidget } = useCreatePageLayoutWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const { removePageLayoutWidgetAndPreservePosition } =
    useRemovePageLayoutWidgetAndPreservePosition(pageLayoutId);

  const { addDraftViewForRecordTableWidget } =
    useAddDraftViewForRecordTableWidget(pageLayoutId);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  // Opportunity first: unlike Company it has the select and date fields kanban and calendar need.
  const firstAvailableObjectMetadataItem =
    [StandardObjectNameSingular.Opportunity, StandardObjectNameSingular.Company]
      .map((nameSingular) =>
        readableObjectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular === nameSingular,
        ),
      )
      .find(isDefined) ||
    [...readableObjectMetadataItems].sort((first, second) =>
      first.labelPlural.localeCompare(second.labelPlural),
    )[0];

  const {
    layoutOptions,
    defaultGroupByFieldMetadataItem,
    defaultCalendarFieldMetadataItem,
  } = useRecordTableWidgetLayoutPickerOptions(firstAvailableObjectMetadataItem);

  const availableLayoutOptions = layoutOptions.filter(
    (layoutOption) => !layoutOption.isDisabled,
  );

  const { data: frontComponentsData } = useQuery<{
    frontComponents: FrontComponent[];
  }>(FIND_MANY_FRONT_COMPONENTS);

  const frontComponents = (frontComponentsData?.frontComponents ?? []).filter(
    (frontComponent) =>
      isFrontComponentAvailableInWidgetPicker({
        frontComponent,
        pageLayoutType: PageLayoutType.DASHBOARD,
      }),
  );

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

  const handleCreateChartWidget = (graphType: GraphType) => {
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
      const newWidget = createPageLayoutGraphWidget({
        fieldSelection,
        graphType,
      });
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.DashboardChartSettings,
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

      const newWidget = createPageLayoutWidget({
        type: WidgetType.IFRAME,
        title: t`Untitled iFrame`,
        configuration: {
          configurationType: WidgetConfigurationType.IFRAME,
          url: null,
        },
      });
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.DashboardIframeSettings,
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

      const newWidget = createPageLayoutWidget({
        type: WidgetType.STANDALONE_RICH_TEXT,
        title: t`Untitled Rich Text`,
        configuration: {
          configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
          body: { tiptap: '', markdown: null },
        },
      });
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    closeSidePanelMenu();
  };

  const handleCreateViewWidget = (
    targetViewType: RecordTableWidgetLayoutViewType,
  ) => {
    if (
      isExistingWidgetMissingOrDifferentType(
        existingWidget?.type,
        WidgetType.RECORD_TABLE,
      )
    ) {
      if (isDefined(pageLayoutEditingWidgetId)) {
        removePageLayoutWidgetAndPreservePosition(pageLayoutEditingWidgetId);
      }

      const newRecordTableWidget = createPageLayoutWidget({
        type: WidgetType.RECORD_TABLE,
        title: firstAvailableObjectMetadataItem?.labelPlural ?? t`Record Table`,
        configuration: {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          isUIEditable: pageLayoutDraft.type === PageLayoutType.RECORD_PAGE,
        },
        objectMetadataId: firstAvailableObjectMetadataItem?.id,
      });

      setPageLayoutEditingWidgetId(newRecordTableWidget.id);

      addDraftViewForRecordTableWidget({
        widgetId: newRecordTableWidget.id,
        objectMetadataItem: firstAvailableObjectMetadataItem,
        targetViewType,
        defaultGroupByFieldMetadataItem,
        defaultCalendarFieldMetadataItem,
      });
    }

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.DashboardRecordTableSettings,
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

      const newWidget = createPageLayoutWidget({
        type: WidgetType.FRONT_COMPONENT,
        title: frontComponent.name,
        configuration: {
          __typename: 'FrontComponentConfiguration',
          configurationType: WidgetConfigurationType.FRONT_COMPONENT,
          frontComponentId: frontComponent.id,
        },
      });
      setPageLayoutEditingWidgetId(newWidget.id);
    }

    closeSidePanelMenu();
  };

  const selectableItemIds = [
    ...GRAPH_TYPE_OPTIONS,
    ...availableLayoutOptions.map(({ viewType }) => viewType),
    'iframe',
    'rich-text',
    ...frontComponentsWithSelectItemId.map(({ selectItemId }) => selectItemId),
  ];

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Charts`}>
        {GRAPH_TYPE_OPTIONS.map((graphType) => (
          <SelectableListItem
            key={graphType}
            itemId={graphType}
            onEnter={() => handleCreateChartWidget(graphType)}
          >
            <CommandMenuItem
              Icon={GRAPH_TYPE_INFORMATION[graphType].icon}
              label={t(GRAPH_TYPE_INFORMATION[graphType].label)}
              id={graphType}
              onClick={() => handleCreateChartWidget(graphType)}
            />
          </SelectableListItem>
        ))}
      </SidePanelGroup>

      <SidePanelGroup heading={t`Views`}>
        {availableLayoutOptions.map(({ viewType, Icon, label }) => (
          <SelectableListItem
            key={viewType}
            itemId={viewType}
            onEnter={() => handleCreateViewWidget(viewType)}
          >
            <CommandMenuItem
              Icon={Icon}
              label={t(label)}
              id={viewType}
              onClick={() => handleCreateViewWidget(viewType)}
            />
          </SelectableListItem>
        ))}
      </SidePanelGroup>

      <SidePanelGroup heading={t`Other`}>
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

      {frontComponentsWithSelectItemId.length > 0 && (
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
