import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { usePerformViewApiPersist } from '@/views/hooks/internal/usePerformViewApiPersist';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { usePerformViewFilterApiPersist } from '@/views/hooks/internal/usePerformViewFilterApiPersist';
import { usePerformViewFilterGroupApiPersist } from '@/views/hooks/internal/usePerformViewFilterGroupApiPersist';
import { usePerformViewSortApiPersist } from '@/views/hooks/internal/usePerformViewSortApiPersist';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { ViewType } from '@/views/types/ViewType';
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
  const { performViewApiCreate } = usePerformViewApiPersist();

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const currentViewId = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
    viewBarComponentId,
  );

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    recordIndexId,
  );

  const { performViewFieldApiCreate } = usePerformViewFieldApiPersist();

  const { performViewSortApiCreate } = usePerformViewSortApiPersist();

  const { performViewFilterApiCreate } = usePerformViewFilterApiPersist();

  const { performViewFilterGroupApiCreate } =
    usePerformViewFilterGroupApiPersist();

  const store = useStore();

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
        calendarEndFieldMetadataId,
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
          | 'calendarEndFieldMetadataId'
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
        viewFromViewIdFamilySelector.selectorFamily({
          viewId: existingCurrentViewId,
        }),
      );

      if (!isDefined(sourceView)) {
        return undefined;
      }

      const viewType = type ?? sourceView.type;

      const result = await performViewApiCreate(
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
            kanbanColumnWidth: shouldCopyFiltersAndSortsAndAggregate
              ? sourceView.kanbanColumnWidth
              : undefined,
            mainGroupByFieldMetadataId: shouldCopyFiltersAndSortsAndAggregate
              ? sourceView.mainGroupByFieldMetadataId
              : mainGroupByFieldMetadataId,
            type: viewType,
            objectMetadataId: sourceView.objectMetadataId,
            anyFieldFilterValue: anyFieldFilterValue,
            calendarLayout:
              viewType === ViewType.CALENDAR
                ? ViewCalendarLayout.MONTH
                : undefined,
            calendarFieldMetadataId:
              viewType === ViewType.CALENDAR
                ? calendarFieldMetadataId
                : undefined,
            calendarEndFieldMetadataId:
              viewType === ViewType.CALENDAR
                ? calendarEndFieldMetadataId
                : undefined,
            visibility,
          },
        },
        objectMetadataItem.id,
      );

      if (result.status === 'failed') {
        return undefined;
      }

      const newViewId = result.response.data?.createView.id;

      if (isUndefinedOrNull(newViewId)) {
        throw new Error('Failed to create view');
      }

      const fieldResult = await performViewFieldApiCreate({
        inputs: sourceView.viewFields.map((viewField) => ({
          id: v4(),
          fieldMetadataId: viewField.fieldMetadataId,
          position: viewField.position,
          isVisible: viewField.isVisible,
          size: viewField.size,
          aggregateOperation: viewField.aggregateOperation,
          viewFieldGroupId: viewField.viewFieldGroupId,
          viewId: newViewId,
        })),
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
          .map((recordSort) => mapRecordSortToViewSort(recordSort))
          .map((viewSort) => ({
            ...viewSort,
            id: v4(),
          }));

        const filterGroupResult = await performViewFilterGroupApiCreate(
          viewFilterGroupsToCreate,
          {
            id: newViewId,
          },
        );

        if (filterGroupResult.status === 'failed') {
          return undefined;
        }

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
              relationTargetFieldMetadataId:
                viewFilter.relationTargetFieldMetadataId ?? null,
            },
          }),
        );

        const filterResult = await performViewFilterApiCreate(
          createViewFilterInputs,
        );

        if (filterResult.status === 'failed') {
          return undefined;
        }

        const createViewSortInputs = viewSortsToCreate.map((viewSort) => ({
          input: {
            id: viewSort.id,
            fieldMetadataId: viewSort.fieldMetadataId,
            viewId: newViewId,
            direction: viewSort.direction,
          },
        }));

        const sortResult = await performViewSortApiCreate(createViewSortInputs);

        if (sortResult.status === 'failed') {
          return undefined;
        }
      }

      return newViewId;
    },
    [
      currentViewId,
      performViewApiCreate,
      anyFieldFilterValue,
      objectMetadataItem,
      performViewFieldApiCreate,
      store,
      currentRecordFilterGroups,
      currentRecordFilters,
      currentRecordSorts,
      performViewFilterGroupApiCreate,
      performViewFilterApiCreate,
      performViewSortApiCreate,
    ],
  );

  return { createViewFromCurrentView };
};
