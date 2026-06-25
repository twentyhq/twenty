import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useAddDraftViewForFieldRelationTableWidget = (
  pageLayoutId: string,
) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const store = useStore();

  const addDraftViewForFieldRelationTableWidget = useCallback(
    (
      widgetId: string,
      targetObjectMetadataId: string,
      inverseFieldMetadataId: string,
    ): string | undefined => {
      const targetObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === targetObjectMetadataId,
      );

      if (!isDefined(targetObjectMetadataItem)) {
        // eslint-disable-next-line no-console
        console.log(
          '[REL_TABLE_DEBUG] 2.addDraftView -> target object NOT FOUND (returns undefined viewId)',
          JSON.stringify({
            widgetId,
            targetObjectMetadataId,
            inverseFieldMetadataId,
            objectMetadataItemsCount: objectMetadataItems.length,
          }),
        );
        return undefined;
      }

      const baseSnapshot = buildRecordTableWidgetViewSnapshot(
        targetObjectMetadataItem,
      );

      const snapshot = {
        ...baseSnapshot,
        viewFilters: [
          {
            id: v4(),
            fieldMetadataId: inverseFieldMetadataId,
            operand: ViewFilterOperand.IS,
            value: JSON.stringify({
              selectedRecordIds: [],
              isCurrentRecordSelected: true,
            }),
            viewId: baseSnapshot.view.id,
            viewFilterGroupId: null,
            positionInViewFilterGroup: null,
            subFieldName: null,
          },
        ],
      };

      store.set(recordTableWidgetViewDraftState, (prev) => ({
        ...prev,
        [widgetId]: snapshot,
      }));

      // eslint-disable-next-line no-console
      console.log(
        '[REL_TABLE_DEBUG] 2.addDraftView -> created draft view',
        JSON.stringify({
          widgetId,
          viewId: snapshot.view.id,
          targetObject: targetObjectMetadataItem.nameSingular,
          viewFieldsCount: snapshot.viewFields.length,
          viewFiltersCount: snapshot.viewFilters.length,
        }),
      );

      return snapshot.view.id;
    },
    [objectMetadataItems, store, recordTableWidgetViewDraftState],
  );

  return { addDraftViewForFieldRelationTableWidget };
};
