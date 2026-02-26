import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { usePerformViewFilterAPIPersist } from '@/views/hooks/internal/usePerformViewFilterAPIPersist';
import { usePerformViewFilterGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFilterGroupAPIPersist';
import { usePerformViewSortAPIPersist } from '@/views/hooks/internal/usePerformViewSortAPIPersist';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { ViewType } from '@/views/types/ViewType';
import { convertViewOpenRecordInToCore } from '@/views/utils/convertViewOpenRecordInToCore';
import { convertViewTypeToCore } from '@/views/utils/convertViewTypeToCore';
import { duplicateViewFiltersAndViewFilterGroups } from '@/views/utils/duplicateViewFiltersAndViewFilterGroups';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateViewFromCurrentView = (viewBarComponentId?: string) => {
  const { performViewAPICreate } = usePerformViewAPIPersist();

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const currentViewId = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
    viewBarComponentId,
  );

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    recordIndexId,
  );

  const { performViewFieldAPICreate } = usePerformViewFieldAPIPersist();

  const { performViewSortAPICreate } = usePerformViewSortAPIPersist();

  const { performViewFilterAPICreate } = usePerformViewFilterAPIPersist();

  const { performViewFilterGroupAPICreate } =
    usePerformViewFilterGroupAPIPersist();

  const store = useStore();

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
    recordIndexId,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const createViewFromCurrentView = useCallback(
    async (
      {
        id,
        name,
        icon,
        mainGroupByFieldMetadataId,
        calendarFieldMetadataId,
        type,
        visibility,
      }: Partial<
        Pick<
          GraphQLView,
          | 'id'
          | 'name'
          | 'icon'
          | 'mainGroupByFieldMetadataId'
          | 'calendarFieldMetadataId'
          | 'type'
          | 'visibility'
        >
      >,
      shouldCopyFiltersAndSortsAndAggregate?: boolean,
    ): Promise<string | undefined> => {
      const existingCurrentViewId = store.get(currentViewId);

      if (!isDefined(existingCurrentViewId)) {
        return undefined;
      }

      const sourceView = store.get(
        coreViewFromViewIdFamilySelector.selectorFamily({
          viewId: existingCurrentViewId,
        }),
      );

      if (!isDefined(sourceView)) {
        return undefined;
      }

      const viewType = type ?? sourceView.type;

      const result = await performViewAPICreate(
        {
          input: {
            id: id ?? v4(),
            name: name ?? sourceView.name,
            icon: icon ?? sourceView.icon,
            key: null,
            kanbanAggregateOperation: shouldCopyFiltersAndSortsAndAggregate
              ? sourceView.kanbanAggregateOperation
              : undefined,
            kanbanAggregateOperationFieldMetadataId:
              shouldCopyFiltersAndSortsAndAggregate
                ? sourceView.kanbanAggregateOperationFieldMetadataId
                : undefined,
            mainGroupByFieldMetadataId: shouldCopyFiltersAndSortsAndAggregate
              ? sourceView.mainGroupByFieldMetadataId
              : mainGroupByFieldMetadataId,
            type: convertViewTypeToCore(viewType),
            objectMetadataId: sourceView.objectMetadataId,
            openRecordIn: convertViewOpenRecordInToCore(
              sourceView.openRecordIn,
            ),
            anyFieldFilterValue: anyFieldFilterValue,
            calendarLayout:
              viewType === ViewType.Calendar
                ? ViewCalendarLayout.MONTH
                : undefined,
            calendarFieldMetadataId:
              viewType === ViewType.Calendar
                ? calendarFieldMetadataId
                : undefined,
            visibility,
          },
        },
        objectMetadataItem.id,
      );

      if (result.status === 'failed') {
        return undefined;
      }

      const newViewId = result.response.data?.createCoreView.id;

      if (isUndefinedOrNull(newViewId)) {
        throw new Error('Failed to create view');
      }

      const fieldResult = await performViewFieldAPICreate({
        inputs: sourceView.viewFields.map(
          ({ __typename, id: _id, ...viewField }) => ({
            ...viewField,
            id: v4(),
            viewId: newViewId,
          }),
        ),
      });

      if (fieldResult.status === 'failed') {
        return undefined;
      }

      if (shouldCopyFiltersAndSortsAndAggregate === true) {
        const viewFilterGroupsToCopy = currentRecordFilterGroups.map(
          (recordFilterGroup) =>
            mapRecordFilterGroupToViewFilterGroup({
              recordFilterGroup,
              view: { id: newViewId },
            }),
        );

        const viewFiltersToCopy = currentRecordFilters.map(
          mapRecordFilterToViewFilter,
        );

        const {
          duplicatedViewFilterGroups: viewFilterGroupsToCreate,
          duplicatedViewFilters: viewFiltersToCreate,
        } = duplicateViewFiltersAndViewFilterGroups({
          viewFilterGroupsToDuplicate: viewFilterGroupsToCopy,
          viewFiltersToDuplicate: viewFiltersToCopy,
        });

        const viewSortsToCreate = currentRecordSorts
          .map((recordSort) => mapRecordSortToViewSort(recordSort, newViewId))
          .map((viewSort) => ({
            ...viewSort,
            id: v4(),
          }));

        await performViewFilterGroupAPICreate(viewFilterGroupsToCreate, {
          id: newViewId,
        });

        const createViewFilterInputs = viewFiltersToCreate.map(
          (viewFilter) => ({
            input: {
              id: viewFilter.id,
              fieldMetadataId: viewFilter.fieldMetadataId,
              viewId: newViewId,
              value: viewFilter.value,
              operand: viewFilter.operand,
              viewFilterGroupId: viewFilter.viewFilterGroupId,
              positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
              subFieldName: viewFilter.subFieldName ?? null,
            },
          }),
        );

        const filterResult = await performViewFilterAPICreate(
          createViewFilterInputs,
        );

        if (filterResult.status === 'failed') {
          return undefined;
        }

        await performViewSortAPICreate(viewSortsToCreate, { id: newViewId });
      }

      await refreshCoreViewsByObjectMetadataId(objectMetadataItem.id);

      return newViewId;
    },
    [
      currentViewId,
      performViewAPICreate,
      anyFieldFilterValue,
      objectMetadataItem,
      performViewFieldAPICreate,
      refreshCoreViewsByObjectMetadataId,
      store,
      currentRecordFilterGroups,
      currentRecordFilters,
      currentRecordSorts,
      performViewFilterGroupAPICreate,
      performViewFilterAPICreate,
      performViewSortAPICreate,
    ],
  );

  return { createViewFromCurrentView };
};
