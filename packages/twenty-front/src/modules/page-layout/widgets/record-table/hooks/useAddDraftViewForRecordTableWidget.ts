import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  type RecordTableConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const isRecordTableConfiguration = (
  configuration: PageLayoutWidget['configuration'] | undefined,
): configuration is RecordTableConfiguration =>
  configuration?.configurationType === WidgetConfigurationType.RECORD_TABLE;

export const useAddDraftViewForRecordTableWidget = (pageLayoutId: string) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const addDraftViewForRecordTableWidget = useCallback(
    (widgetId: string, objectMetadataItem: EnrichedObjectMetadataItem) => {
      const snapshot = buildRecordTableWidgetViewSnapshot(objectMetadataItem);

      store.set(recordTableWidgetViewDraftState, (prev) => ({
        ...prev,
        [widgetId]: snapshot,
      }));

      requestAnimationFrame(() => {
        const latestWidgetConfiguration = store
          .get(pageLayoutDraftState)
          .tabs.flatMap((tab) => tab.widgets)
          .find((widget) => widget.id === widgetId)?.configuration;

        const recordTableConfigurationToPreserve = isRecordTableConfiguration(
          latestWidgetConfiguration,
        )
          ? latestWidgetConfiguration
          : {
              configurationType: WidgetConfigurationType.RECORD_TABLE,
            };

        updatePageLayoutWidget(widgetId, {
          configuration: {
            ...recordTableConfigurationToPreserve,
            viewId: snapshot.view.id,
          },
        });
      });
    },
    [
      store,
      pageLayoutDraftState,
      recordTableWidgetViewDraftState,
      updatePageLayoutWidget,
    ],
  );

  return { addDraftViewForRecordTableWidget };
};
