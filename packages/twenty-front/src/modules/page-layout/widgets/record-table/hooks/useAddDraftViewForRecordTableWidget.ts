import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { filterFieldsForRecordTableViewCreation } from '@/page-layout/widgets/record-table/utils/filterFieldsForRecordTableViewCreation';
import { sortFieldsByRelevanceForRecordTableWidget } from '@/page-layout/widgets/record-table/utils/sortFieldsByRelevanceForRecordTableWidget';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const DEFAULT_VIEW_FIELD_SIZE = 180;
const INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET = 6;

export const useAddDraftViewForRecordTableWidget = (pageLayoutId: string) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const addDraftViewForRecordTableWidget = useCallback(
    (widgetId: string, objectMetadataItem: EnrichedObjectMetadataItem) => {
      const newViewId = v4();

      const flatView: FlatView = {
        id: newViewId,
        name: `${objectMetadataItem.labelPlural} Table`,
        icon: objectMetadataItem.icon ?? 'IconTable',
        objectMetadataId: objectMetadataItem.id,
        type: ViewType.TABLE_WIDGET,
        isCompact: false,
        position: 0,
        openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
        visibility: ViewVisibility.UNLISTED,
        shouldHideEmptyGroups: false,
      };

      const eligibleFields = objectMetadataItem.fields.filter(
        filterFieldsForRecordTableViewCreation,
      );

      const sortedFields = eligibleFields.toSorted(
        sortFieldsByRelevanceForRecordTableWidget(
          objectMetadataItem.labelIdentifierFieldMetadataId,
        ),
      );

      const flatViewFields: FlatViewField[] = sortedFields.map(
        (field, index) => ({
          id: v4(),
          viewId: newViewId,
          fieldMetadataId: field.id,
          position: index,
          size: DEFAULT_VIEW_FIELD_SIZE,
          isVisible: index < INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET,
          isActive: true,
        }),
      );

      store.set(recordTableWidgetViewDraftState, (prev) => ({
        ...prev,
        [widgetId]: {
          view: flatView,
          viewFields: flatViewFields,
          viewFilters: [],
          viewFilterGroups: [],
          viewSorts: [],
        },
      }));

      requestAnimationFrame(() => {
        updatePageLayoutWidget(widgetId, {
          configuration: {
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            viewId: newViewId,
          },
        });
      });
    },
    [store, recordTableWidgetViewDraftState, updatePageLayoutWidget],
  );

  return { addDraftViewForRecordTableWidget };
};
