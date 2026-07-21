import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const cloneRecordTableWidgetViewSnapshot = (
  sourceSnapshot: RecordTableWidgetViewSnapshot,
): RecordTableWidgetViewSnapshot => {
  const newViewId = uuidv4();

  const previousToNewFilterGroupId = new Map(
    sourceSnapshot.viewFilterGroups.map((filterGroup) => [
      filterGroup.id,
      uuidv4(),
    ]),
  );

  return {
    view: {
      ...sourceSnapshot.view,
      id: newViewId,
    },
    viewFields: sourceSnapshot.viewFields.map((viewField) => ({
      ...viewField,
      id: uuidv4(),
      viewId: newViewId,
    })),
    viewFilterGroups: sourceSnapshot.viewFilterGroups.map((filterGroup) => ({
      ...filterGroup,
      id: previousToNewFilterGroupId.get(filterGroup.id) ?? uuidv4(),
      viewId: newViewId,
      parentViewFilterGroupId: isDefined(filterGroup.parentViewFilterGroupId)
        ? (previousToNewFilterGroupId.get(
            filterGroup.parentViewFilterGroupId,
          ) ?? null)
        : filterGroup.parentViewFilterGroupId,
    })),
    viewFilters: sourceSnapshot.viewFilters.map((viewFilter) => ({
      ...viewFilter,
      id: uuidv4(),
      viewId: newViewId,
      viewFilterGroupId: isDefined(viewFilter.viewFilterGroupId)
        ? (previousToNewFilterGroupId.get(viewFilter.viewFilterGroupId) ?? null)
        : viewFilter.viewFilterGroupId,
    })),
    viewSorts: sourceSnapshot.viewSorts.map((viewSort) => ({
      ...viewSort,
      id: uuidv4(),
      viewId: newViewId,
    })),
    viewGroups: sourceSnapshot.viewGroups.map((viewGroup) => ({
      ...viewGroup,
      id: uuidv4(),
      viewId: newViewId,
    })),
  };
};
