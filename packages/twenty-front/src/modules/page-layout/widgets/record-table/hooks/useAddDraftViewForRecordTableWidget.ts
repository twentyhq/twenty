import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const useAddDraftViewForRecordTableWidget = (pageLayoutId: string) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

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
        updatePageLayoutWidget(widgetId, {
          configuration: {
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            viewId: snapshot.view.id,
          },
        });
      });
    },
    [store, recordTableWidgetViewDraftState, updatePageLayoutWidget],
  );

  return { addDraftViewForRecordTableWidget };
};
