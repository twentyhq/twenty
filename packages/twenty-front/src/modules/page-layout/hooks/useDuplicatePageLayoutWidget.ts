import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useDeepCopyViewInMetadataStore } from '@/page-layout/hooks/useDeepCopyViewInMetadataStore';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { buildFieldsWidgetGroupsFromFlatViewData } from '@/page-layout/utils/buildFieldsWidgetGroupsFromFlatViewData';
import { generateDuplicatedTimestamps } from '@/page-layout/utils/generateDuplicatedTimestamps';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { appendCopySuffix, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '~/generated-metadata/graphql';

export const useDuplicatePageLayoutWidget = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
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

  const setPageLayoutEditingWidgetId = useSetAtomComponentState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    getScrollWrapperInstanceIdFromPageLayoutId(pageLayoutId),
  );

  const store = useStore();

  const { deepCopyView } = useDeepCopyViewInMetadataStore();

  const duplicateWidget = useCallback(
    (widgetId: string): string => {
      const pageLayoutDraft = store.get(pageLayoutDraftState);

      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const sourceWidget = pageLayoutDraft.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === widgetId);

      if (!isDefined(sourceWidget)) {
        throw new Error(`Widget with id ${widgetId} not found`);
      }

      const sourceTab = pageLayoutDraft.tabs.find(
        (tab) => tab.id === sourceWidget.pageLayoutTabId,
      );

      if (!isDefined(sourceTab)) {
        throw new Error(
          `Tab with id ${sourceWidget.pageLayoutTabId} not found`,
        );
      }

      const newWidgetId = uuidv4();

      let clonedConfiguration = sourceWidget.configuration;

      const sourceViewId = getWidgetConfigurationViewId(
        sourceWidget.configuration,
      );

      if (
        sourceWidget.type === WidgetType.FIELDS &&
        isDefined(sourceViewId)
      ) {
        const copyResult = deepCopyView(sourceViewId);

        if (isDefined(copyResult)) {
          clonedConfiguration = {
            ...sourceWidget.configuration,
            viewId: copyResult.newViewId,
          };

          const objectMetadataId = pageLayoutDraft.objectMetadataId;

          const objectMetadataItems = store.get(
            objectMetadataItemsSelector.atom,
          );
          const objectMetadataItem = isDefined(objectMetadataId)
            ? objectMetadataItems.find(
                (item) => item.id === objectMetadataId,
              )
            : undefined;
          const fieldMetadataItems = objectMetadataItem?.fields ?? [];

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

      const clonedWidget: PageLayoutWidget = {
        ...sourceWidget,
        id: newWidgetId,
        title: appendCopySuffix(sourceWidget.title),
        configuration: clonedConfiguration,
        ...generateDuplicatedTimestamps(),
      };

      const currentTabLayouts = allTabLayouts[sourceTab.id] ?? {
        desktop: [],
        mobile: [],
      };

      const sourceLayout = currentTabLayouts.desktop.find(
        (layout) => layout.i === widgetId,
      );

      if (!isDefined(sourceLayout)) {
        throw new Error(`Layout for widget ${widgetId} not found`);
      }

      const maxY = currentTabLayouts.desktop.reduce(
        (max, layout) => Math.max(max, layout.y + layout.h),
        0,
      );

      const newLayout = {
        ...sourceLayout,
        i: newWidgetId,
        y: maxY,
      };

      const updatedLayouts = getUpdatedTabLayouts(
        allTabLayouts,
        sourceTab.id,
        newLayout,
      );

      store.set(pageLayoutCurrentLayoutsState, updatedLayouts);

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: addWidgetToTab(prev.tabs, sourceTab.id, clonedWidget),
      }));

      setPageLayoutEditingWidgetId(newWidgetId);

      const { scrollWrapperElement } = getScrollWrapperElement();

      if (isDefined(scrollWrapperElement)) {
        requestAnimationFrame(() => {
          const widgetElement = scrollWrapperElement.querySelector(
            `[data-widget-id="${newWidgetId}"]`,
          );

          if (isDefined(widgetElement)) {
            widgetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        });
      }

      return newWidgetId;
    },
    [
      deepCopyView,
      fieldsWidgetEditorModeDraft,
      fieldsWidgetGroupsDraft,
      fieldsWidgetUngroupedFieldsDraft,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      setPageLayoutEditingWidgetId,
      getScrollWrapperElement,
      store,
    ],
  );

  return { duplicateWidget };
};
