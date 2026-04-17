import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { FIND_MANY_FRONT_COMPONENTS } from '@/front-components/graphql/queries/findManyFrontComponents';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useInsertCreatedWidgetAtContext } from '@/page-layout/hooks/useInsertCreatedWidgetAtContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultFieldWidget } from '@/page-layout/utils/createDefaultFieldWidget';
import { createDefaultFieldsWidget } from '@/page-layout/utils/createDefaultFieldsWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { useFieldWidgetEligibleFields } from '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields';
import { getFieldWidgetDefaultDisplayMode } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { getFrontComponentWidgetTypeSelectItemId } from '@/side-panel/pages/page-layout/utils/getFrontComponentWidgetTypeSelectItemId';
import { resolveWidgetTypeSelectTargetTabId } from '@/side-panel/pages/page-layout/utils/resolveWidgetTypeSelectTargetTabId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconApps, IconList } from 'twenty-ui/display';
import { v4 as uuidv4 } from 'uuid';
import {
  type FrontComponent,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const SidePanelPageLayoutRecordPageWidgetTypeSelect = () => {
  const { pageLayoutId, objectNameSingular: targetObjectNameSingular } =
    usePageLayoutIdFromContextStore();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useAtomComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );

  const widgetInsertionContext = useAtomComponentStateValue(
    widgetInsertionContextComponentState,
    pageLayoutId,
  );

  const widgetCreationTargetTabId = useAtomComponentStateValue(
    widgetCreationTargetTabIdComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const { insertCreatedWidgetAtContext } =
    useInsertCreatedWidgetAtContext(pageLayoutId);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const allFieldWidgetFields = useFieldWidgetEligibleFields(
    targetObjectNameSingular,
  );

  const tabId = resolveWidgetTypeSelectTargetTabId({
    pageLayoutEditingWidgetId,
    tabs: pageLayoutDraft.tabs,
    widgetCreationTargetTabId,
  });

  const isReplaceMode =
    isDefined(pageLayoutEditingWidgetId) && !isDefined(widgetInsertionContext);

  const existingWidget = isReplaceMode
    ? pageLayoutDraft.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId)
    : undefined;

  const getExistingWidgetPositionIndex = useCallback(() => {
    if (!isDefined(existingWidget?.position)) {
      return undefined;
    }

    if (isVerticalListPosition(existingWidget.position)) {
      return existingWidget.position.index;
    }

    return undefined;
  }, [existingWidget]);

  const removeExistingWidgetIfReplacing = useCallback(() => {
    if (!isReplaceMode || !isDefined(pageLayoutEditingWidgetId)) {
      return;
    }

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: removeWidgetFromTab(prev.tabs, tabId, pageLayoutEditingWidgetId),
    }));
  }, [
    isReplaceMode,
    pageLayoutDraftState,
    pageLayoutEditingWidgetId,
    store,
    tabId,
  ]);

  const { data: frontComponentsData } = useQuery<{
    frontComponents: FrontComponent[];
  }>(FIND_MANY_FRONT_COMPONENTS);

  const frontComponents = frontComponentsData?.frontComponents ?? [];

  const frontComponentsWithSelectItemId = frontComponents.map(
    (frontComponent) => ({
      frontComponent,
      selectItemId: getFrontComponentWidgetTypeSelectItemId(frontComponent.id),
    }),
  );

  const handleCreateFieldsWidget = useCallback(() => {
    const replacePositionIndex = getExistingWidgetPositionIndex();

    const viewId = uuidv4();

    removeExistingWidgetIfReplacing();

    const updatedPageLayout = store.get(pageLayoutDraftState);
    const activeTab = updatedPageLayout.tabs.find((tab) => tab.id === tabId);
    const positionIndex =
      replacePositionIndex ?? activeTab?.widgets.length ?? 0;
    const widgetId = uuidv4();

    const newWidget = createDefaultFieldsWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      viewId,
      objectMetadataId: objectMetadataItem.id,
      positionIndex,
    });

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
    }));

    setPageLayoutEditingWidgetId(widgetId);
    insertCreatedWidgetAtContext(widgetId);

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.RecordPageFieldsSettings,
      focusTitleInput: true,
      resetNavigationStack: true,
    });
  }, [
    getExistingWidgetPositionIndex,
    insertCreatedWidgetAtContext,
    navigatePageLayoutSidePanel,
    objectMetadataItem.id,
    pageLayoutDraftState,
    removeExistingWidgetIfReplacing,
    setPageLayoutEditingWidgetId,
    store,
    tabId,
  ]);

  const handleCreateFieldWidget = useCallback(() => {
    const replacePositionIndex = getExistingWidgetPositionIndex();
    removeExistingWidgetIfReplacing();

    const updatedPageLayout = store.get(pageLayoutDraftState);
    const activeTab = updatedPageLayout.tabs.find((tab) => tab.id === tabId);
    const existingWidgets = activeTab?.widgets ?? [];
    const positionIndex = replacePositionIndex ?? existingWidgets.length;
    const widgetId = uuidv4();

    const usedFieldMetadataIds = new Set(
      existingWidgets
        .filter(
          (widget) =>
            widget.configuration.configurationType ===
            WidgetConfigurationType.FIELD,
        )
        .map((widget) => {
          const configuration = widget.configuration as {
            fieldMetadataId: string;
          };
          return configuration.fieldMetadataId;
        }),
    );

    const unusedField = allFieldWidgetFields.find(
      (field) => !usedFieldMetadataIds.has(field.id),
    );

    const selectedField = unusedField ?? allFieldWidgetFields[0];

    const fieldMetadataId = selectedField?.id ?? '';
    const title = selectedField?.label ?? '';

    const newWidget = createDefaultFieldWidget({
      id: widgetId,
      pageLayoutTabId: tabId,
      title,
      fieldMetadataId,
      fieldDisplayMode: isDefined(selectedField)
        ? getFieldWidgetDefaultDisplayMode(selectedField.type)
        : undefined,
      objectMetadataId: objectMetadataItem.id,
      positionIndex,
    });

    store.set(pageLayoutDraftState, (prev) => ({
      ...prev,
      tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
    }));

    setPageLayoutEditingWidgetId(widgetId);
    insertCreatedWidgetAtContext(widgetId);

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.RecordPageFieldSettings,
      focusTitleInput: true,
      resetNavigationStack: true,
    });
  }, [
    allFieldWidgetFields,
    getExistingWidgetPositionIndex,
    insertCreatedWidgetAtContext,
    navigatePageLayoutSidePanel,
    objectMetadataItem.id,
    pageLayoutDraftState,
    removeExistingWidgetIfReplacing,
    setPageLayoutEditingWidgetId,
    store,
    tabId,
  ]);

  const handleCreateFrontComponentWidget = useCallback(
    (frontComponent: FrontComponent) => {
      const replacePositionIndex = getExistingWidgetPositionIndex();
      removeExistingWidgetIfReplacing();

      const updatedPageLayout = store.get(pageLayoutDraftState);
      const activeTab = updatedPageLayout.tabs.find((tab) => tab.id === tabId);
      const positionIndex =
        replacePositionIndex ?? activeTab?.widgets.length ?? 0;
      const widgetId = uuidv4();

      const newWidget: PageLayoutWidget = {
        __typename: 'PageLayoutWidget',
        id: widgetId,
        applicationId: '',
        isActive: true,
        pageLayoutTabId: tabId,
        title: frontComponent.name,
        type: WidgetType.FRONT_COMPONENT,
        configuration: {
          __typename: 'FrontComponentConfiguration',
          configurationType: WidgetConfigurationType.FRONT_COMPONENT,
          frontComponentId: frontComponent.id,
        },
        gridPosition: {
          __typename: 'GridPosition',
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 12,
        },
        position: {
          __typename: 'PageLayoutWidgetVerticalListPosition',
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: positionIndex,
        },
        objectMetadataId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: addWidgetToTab(prev.tabs, tabId, newWidget),
      }));

      setPageLayoutEditingWidgetId(widgetId);
      insertCreatedWidgetAtContext(widgetId);

      closeSidePanelMenu();
    },
    [
      closeSidePanelMenu,
      getExistingWidgetPositionIndex,
      insertCreatedWidgetAtContext,
      pageLayoutDraftState,
      removeExistingWidgetIfReplacing,
      setPageLayoutEditingWidgetId,
      store,
      tabId,
    ],
  );

  const selectableItemIds = [
    'fields',
    'field',
    ...frontComponentsWithSelectItemId.map(({ selectItemId }) => selectItemId),
  ];

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Widget type`}>
        <SelectableListItem itemId="fields" onEnter={handleCreateFieldsWidget}>
          <CommandMenuItem
            Icon={IconList}
            label={t`Fields`}
            id="fields"
            onClick={handleCreateFieldsWidget}
          />
        </SelectableListItem>
        <SelectableListItem itemId="field" onEnter={handleCreateFieldWidget}>
          <CommandMenuItem
            Icon={IconList}
            label={t`Field`}
            id="field"
            onClick={handleCreateFieldWidget}
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
