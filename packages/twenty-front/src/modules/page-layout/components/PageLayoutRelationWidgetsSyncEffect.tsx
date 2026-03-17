import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { useBasePageLayout } from '@/page-layout/hooks/useBasePageLayout';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { injectRelationWidgetsIntoLayout } from '@/page-layout/utils/injectRelationWidgetsIntoLayout';
import { isDynamicRelationWidget } from '@/page-layout/utils/isDynamicRelationWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutRelationWidgetsSyncEffectProps = {
  pageLayoutId: string;
};

export const PageLayoutRelationWidgetsSyncEffect = ({
  pageLayoutId,
}: PageLayoutRelationWidgetsSyncEffectProps) => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const pageLayoutIsInitialized = useAtomComponentStateValue(
    pageLayoutIsInitializedComponentState,
  );

  const basePageLayout = useBasePageLayout(pageLayoutId);

  const { boxedRelationFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular: targetRecordIdentifier?.targetObjectNameSingular ?? '',
  });

  const pageLayoutPersistedComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutDraftComponentState);

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutCurrentLayoutsComponentState);

  const store = useStore();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const getDraftWithSyncedDynamicRelationWidgets = useCallback(
    (
      currentDraft: DraftPageLayout,
      layoutWithRelationWidgets: PageLayout,
    ): DraftPageLayout => {
      return {
        ...currentDraft,
        tabs: currentDraft.tabs.map((draftTab) => {
          const persistedTab = layoutWithRelationWidgets.tabs.find(
            (tab) => tab.id === draftTab.id,
          );

          if (!isDefined(persistedTab)) {
            return draftTab;
          }

          const dynamicRelationWidgets = persistedTab.widgets.filter(
            isDynamicRelationWidget,
          );

          const nonDynamicWidgets = draftTab.widgets.filter(
            (widget) => !isDynamicRelationWidget(widget),
          );

          if (dynamicRelationWidgets.length === 0) {
            return {
              ...draftTab,
              widgets: nonDynamicWidgets,
            };
          }

          const firstFieldsWidgetIndex = nonDynamicWidgets.findIndex(
            (widget) => widget.type === WidgetType.FIELDS,
          );

          if (firstFieldsWidgetIndex === -1) {
            return {
              ...draftTab,
              widgets: [...nonDynamicWidgets, ...dynamicRelationWidgets],
            };
          }

          const widgetsBeforeFields = nonDynamicWidgets.slice(
            0,
            firstFieldsWidgetIndex + 1,
          );
          const widgetsAfterFields = nonDynamicWidgets.slice(
            firstFieldsWidgetIndex + 1,
          );

          return {
            ...draftTab,
            widgets: [
              ...widgetsBeforeFields,
              ...dynamicRelationWidgets,
              ...widgetsAfterFields,
            ],
          };
        }),
      };
    },
    [],
  );

  const syncPageLayoutWithRelationWidgets = useCallback(
    (layout: PageLayout) => {
      const currentPersisted = store.get(
        pageLayoutPersistedComponentCallbackState,
      );

      if (!isDeeplyEqual(layout, currentPersisted)) {
        store.set(pageLayoutPersistedComponentCallbackState, layout);

        const currentDraft = store.get(pageLayoutDraftComponentCallbackState);

        const nextDraft = isLayoutCustomizationModeEnabled
          ? getDraftWithSyncedDynamicRelationWidgets(currentDraft, layout)
          : {
              id: layout.id,
              name: layout.name,
              type: layout.type,
              objectMetadataId: layout.objectMetadataId,
              tabs: layout.tabs,
              defaultTabToFocusOnMobileAndSidePanelId:
                layout.defaultTabToFocusOnMobileAndSidePanelId,
            };

        if (!isDeeplyEqual(nextDraft, currentDraft)) {
          store.set(pageLayoutDraftComponentCallbackState, nextDraft);
        }

        const tabLayouts = convertPageLayoutToTabLayouts({
          ...layout,
          tabs: nextDraft.tabs,
        });
        store.set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);
      }
    },
    [
      getDraftWithSyncedDynamicRelationWidgets,
      isLayoutCustomizationModeEnabled,
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
      store,
    ],
  );

  useEffect(() => {
    if (!pageLayoutIsInitialized) {
      return;
    }

    if (!isDefined(basePageLayout)) {
      return;
    }

    const isRecordPage = layoutType === PageLayoutType.RECORD_PAGE;
    if (!isRecordPage) {
      return;
    }

    const layoutWithRelationWidgets = injectRelationWidgetsIntoLayout(
      basePageLayout,
      boxedRelationFieldMetadataItems,
    );

    syncPageLayoutWithRelationWidgets(layoutWithRelationWidgets);
  }, [
    basePageLayout,
    boxedRelationFieldMetadataItems,
    pageLayoutIsInitialized,
    layoutType,
    syncPageLayoutWithRelationWidgets,
  ]);

  return null;
};
