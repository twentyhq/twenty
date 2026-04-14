import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useDeepCopyViewInMetadataStore } from '@/page-layout/hooks/useDeepCopyViewInMetadataStore';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildFieldsWidgetGroupsFromFlatViewData } from '@/page-layout/utils/buildFieldsWidgetGroupsFromFlatViewData';
import { generateDuplicatedTimestamps } from '@/page-layout/utils/generateDuplicatedTimestamps';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { calculateNewPosition } from '@/ui/layout/draggable-list/utils/calculateNewPosition';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { appendCopySuffix, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '~/generated-metadata/graphql';

export const useDuplicatePageLayoutTab = ({
  pageLayoutId: pageLayoutIdFromProps,
  tabListInstanceId,
}: {
  pageLayoutId: string;
  tabListInstanceId: string;
}) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraft = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayouts = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsDraft = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraft = useAtomComponentStateCallbackState(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetEditorModeDraft = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { deepCopyView } = useDeepCopyViewInMetadataStore();

  const duplicateTab = useCallback(
    (tabId: string): string => {
      const currentPageLayoutDraft = store.get(pageLayoutDraft);

      const allTabLayouts = store.get(pageLayoutCurrentLayouts);

      const sourceTab = currentPageLayoutDraft.tabs.find(
        (tab) => tab.id === tabId,
      );

      if (!isDefined(sourceTab)) {
        throw new Error(`Tab with id ${tabId} not found`);
      }

      const objectMetadataId = currentPageLayoutDraft.objectMetadataId;

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);
      const objectMetadataItem = isDefined(objectMetadataId)
        ? objectMetadataItems.find((item) => item.id === objectMetadataId)
        : undefined;
      const fieldMetadataItems = objectMetadataItem?.fields ?? [];

      const newTabId = uuidv4();
      const widgetOldIdNewIdMap = new Map<string, string>();

      const clonedWidgets: PageLayoutWidget[] = sourceTab.widgets.map(
        (widget) => {
          const newWidgetId = uuidv4();
          widgetOldIdNewIdMap.set(widget.id, newWidgetId);

          let clonedConfiguration = widget.configuration;
          const sourceViewId = getWidgetConfigurationViewId(
            widget.configuration,
          );

          if (
            widget.type === WidgetType.FIELDS &&
            isDefined(sourceViewId)
          ) {
            const copyResult = deepCopyView(sourceViewId);

            if (isDefined(copyResult)) {
              clonedConfiguration = {
                ...widget.configuration,
                viewId: copyResult.newViewId,
              };

              const buildResult = buildFieldsWidgetGroupsFromFlatViewData({
                flatViewFieldGroups: copyResult.copiedViewFieldGroups,
                flatViewFields: copyResult.copiedViewFields,
                fieldMetadataItems,
              });

              if (buildResult.editorMode === 'grouped') {
                store.set(fieldsWidgetGroupsDraft, (prev) => ({
                  ...prev,
                  [newWidgetId]: buildResult.groups,
                }));
              } else {
                store.set(fieldsWidgetUngroupedFieldsDraft, (prev) => ({
                  ...prev,
                  [newWidgetId]: buildResult.ungroupedFields,
                }));
              }

              store.set(fieldsWidgetEditorModeDraft, (prev) => ({
                ...prev,
                [newWidgetId]: buildResult.editorMode,
              }));
            }
          }

          return {
            ...widget,
            id: newWidgetId,
            pageLayoutTabId: newTabId,
            configuration: clonedConfiguration,
            ...generateDuplicatedTimestamps(),
          };
        },
      );

      const sortedTabs = sortTabsByPosition(currentPageLayoutDraft.tabs);
      const sourceIndex = sortedTabs.findIndex((t) => t.id === tabId);

      const newTabPosition = calculateNewPosition({
        items: sortedTabs,
        destinationIndex: sourceIndex + 1,
        sourceIndex,
      });

      const newTab: PageLayoutTab = {
        ...sourceTab,
        id: newTabId,
        title: appendCopySuffix(sourceTab.title),
        position: newTabPosition,
        widgets: clonedWidgets,
        ...generateDuplicatedTimestamps(),
      };

      const sourceLayouts = allTabLayouts[tabId] ?? {
        desktop: [],
        mobile: [],
      };

      const newLayouts = {
        desktop: sourceLayouts.desktop.map((layout) => ({
          ...layout,
          i: widgetOldIdNewIdMap.get(layout.i) || layout.i,
        })),
        mobile: sourceLayouts.mobile.map((layout) => ({
          ...layout,
          i: widgetOldIdNewIdMap.get(layout.i) || layout.i,
        })),
      };

      store.set(pageLayoutCurrentLayouts, {
        ...allTabLayouts,
        [newTabId]: newLayouts,
      });

      const prev = store.get(pageLayoutDraft);
      store.set(pageLayoutDraft, {
        ...prev,
        tabs: [...prev.tabs, newTab],
      });

      closeSidePanelMenu();

      setActiveTabId(newTabId);

      navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        pageTitle: newTab.title,
        focusTitleInput: true,
      });

      setPageLayoutTabSettingsOpenTabId(newTabId);

      return newTabId;
    },
    [
      closeSidePanelMenu,
      deepCopyView,
      fieldsWidgetEditorModeDraft,
      fieldsWidgetGroupsDraft,
      fieldsWidgetUngroupedFieldsDraft,
      navigatePageLayoutSidePanel,
      pageLayoutCurrentLayouts,
      pageLayoutDraft,
      setActiveTabId,
      setPageLayoutTabSettingsOpenTabId,
      store,
    ],
  );

  return { duplicateTab };
};
