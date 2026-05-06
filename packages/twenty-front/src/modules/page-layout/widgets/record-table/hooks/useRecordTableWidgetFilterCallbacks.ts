import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type UseRecordTableWidgetFilterCallbacksParams = {
  pageLayoutId: string;
  widgetId: string;
  viewId: string;
  recordIndexId: string;
};

export const useRecordTableWidgetFilterCallbacks = ({
  pageLayoutId,
  widgetId,
  viewId,
  recordIndexId,
}: UseRecordTableWidgetFilterCallbacksParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const currentRecordFiltersState = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const currentRecordFilterGroupsState = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const store = useStore();

  const handleFilterUpdate = () => {
    const currentRecordFilters = store.get(currentRecordFiltersState);
    const currentRecordFilterGroups = store.get(currentRecordFilterGroupsState);

    store.set(recordTableWidgetViewDraftState, (prev) => {
      const widgetViewDraft = prev[widgetId];

      if (!isDefined(widgetViewDraft)) {
        return prev;
      }

      return {
        ...prev,
        [widgetId]: {
          ...widgetViewDraft,
          viewFilters: currentRecordFilters.map((recordFilter) => ({
            id: recordFilter.id,
            fieldMetadataId: recordFilter.fieldMetadataId,
            operand: recordFilter.operand,
            value: recordFilter.value,
            viewId,
            viewFilterGroupId: recordFilter.recordFilterGroupId ?? null,
            positionInViewFilterGroup:
              recordFilter.positionInRecordFilterGroup ?? null,
            subFieldName: recordFilter.subFieldName ?? null,
          })),
          viewFilterGroups: currentRecordFilterGroups.map((recordFilterGroup) =>
            mapRecordFilterGroupToViewFilterGroup({
              recordFilterGroup,
              view: { id: viewId },
            }),
          ),
        },
      };
    });
  };

  return { handleFilterUpdate };
};
