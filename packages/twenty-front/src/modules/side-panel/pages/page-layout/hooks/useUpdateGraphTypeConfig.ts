import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { convertAggregateOperationForDateField } from '@/side-panel/pages/page-layout/utils/convertAggregateOperationForDateField';
import { getChartConfigurationUpdateForGraphType } from '@/side-panel/pages/page-layout/utils/getChartConfigurationUpdateForGraphType';
import { getConfigurationTypeFromGraphType } from '@/side-panel/pages/page-layout/utils/getConfigurationTypeFromGraphType';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { updateWidgetMinimumSizeForGraphType } from '@/page-layout/utils/updateWidgetMinimumSizeForGraphType';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useGetConfigToUpdateAfterGraphTypeChange = ({
  pageLayoutId,
  widget,
}: {
  pageLayoutId: string;
  widget: PageLayoutWidget;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const currentlyEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const getConfigToUpdateAfterGraphTypeChange = useCallback(
    (graphType: GraphType) => {
      const currentlyEditingWidgetId = store.get(currentlyEditingWidgetIdState);

      if (!isDefined(currentlyEditingWidgetId)) {
        throw new Error(doNotTranslate('No widget is currently being edited'));
      }

      const draftPageLayout = store.get(pageLayoutDraftState);

      const widgetInDraft = draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((w) => w.id === currentlyEditingWidgetId);

      if (
        !isDefined(widgetInDraft) ||
        !isDefined(widgetInDraft.configuration)
      ) {
        throw new Error(
          doNotTranslate('Widget configuration not found in draft state'),
        );
      }

      const currentConfiguration = widgetInDraft.configuration;

      if (!isWidgetConfigurationOfTypeGraph(currentConfiguration)) {
        throw new Error(
          doNotTranslate('Widget configuration is not a chart configuration'),
        );
      }

      const newConfigurationType = getConfigurationTypeFromGraphType(graphType);

      let configToUpdate = getChartConfigurationUpdateForGraphType({
        currentConfiguration,
        graphType,
      });

      if (graphType !== GraphType.AGGREGATE) {
        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === widget.objectMetadataId,
        );

        const convertedAggregateOperation =
          convertAggregateOperationForDateField(
            currentConfiguration,
            objectMetadataItem,
          );

        if (isDefined(convertedAggregateOperation)) {
          configToUpdate = {
            ...configToUpdate,
            aggregateOperation: convertedAggregateOperation,
          };
        }
      }

      const activeTabId = store.get(
        activeTabIdComponentState.atomFamily({
          instanceId: tabListInstanceId,
        }),
      );

      if (isDefined(activeTabId) && isDefined(currentlyEditingWidgetId)) {
        const currentLayouts = store.get(pageLayoutCurrentLayoutsState);

        const updatedLayouts = updateWidgetMinimumSizeForGraphType({
          configurationType: newConfigurationType,
          widgetId: currentlyEditingWidgetId,
          tabId: activeTabId,
          currentLayouts,
        });

        store.set(pageLayoutCurrentLayoutsState, updatedLayouts);
      }

      return configToUpdate;
    },
    [
      currentlyEditingWidgetIdState,
      objectMetadataItems,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      store,
      tabListInstanceId,
      widget.objectMetadataId,
    ],
  );

  return { getConfigToUpdateAfterGraphTypeChange };
};
