import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroupRecords';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { isPersistingViewFieldsState } from '@/views/states/isPersistingViewFieldsState';
import { GraphQLView } from '@/views/types/GraphQLView';
import { View } from '@/views/types/View';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewGroup } from '@/views/types/ViewGroup';
import { ViewSort } from '@/views/types/ViewSort';
import { ViewType } from '@/views/types/ViewType';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';
import { v4 } from 'uuid';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateViewFromCurrentView = (viewBarComponentId?: string) => {
  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    contextStoreCurrentViewIdComponentState,
    viewBarComponentId,
  );

  const { createOneRecord } = useCreateOneRecord<View>({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { createViewFieldRecords } = usePersistViewFieldRecords();

  const { createViewSortRecords } = usePersistViewSortRecords();

  const { createViewGroupRecords } = usePersistViewGroupRecords();

  const { createViewFilterRecords } = usePersistViewFilterRecords();

  const { createViewFilterGroupRecords } = usePersistViewFilterGroupRecords();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { findManyRecords } = useLazyFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.View,
    fetchPolicy: 'network-only',
  });

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const createViewFromCurrentView = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        {
          id,
          name,
          icon,
          kanbanFieldMetadataId,
          type,
        }: Partial<
          Pick<
            GraphQLView,
            'id' | 'name' | 'icon' | 'kanbanFieldMetadataId' | 'type'
          >
        >,
        shouldCopyFiltersAndSortsAndAggregate?: boolean,
      ) => {
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        if (!isDefined(currentViewId)) {
          return;
        }

        const sourceView = snapshot
          .getLoadable(
            prefetchViewFromViewIdFamilySelector({
              viewId: currentViewId,
            }),
          )
          .getValue();

        if (!isDefined(sourceView)) {
          return;
        }

        set(isPersistingViewFieldsState, true);

        const newView = await createOneRecord({
          id: id ?? v4(),
          name: name ?? sourceView.name,
          icon: icon ?? sourceView.icon,
          key: null,
          kanbanFieldMetadataId:
            kanbanFieldMetadataId ?? sourceView.kanbanFieldMetadataId,
          kanbanAggregateOperation: shouldCopyFiltersAndSortsAndAggregate
            ? sourceView.kanbanAggregateOperation
            : undefined,
          kanbanAggregateOperationFieldMetadataId:
            shouldCopyFiltersAndSortsAndAggregate
              ? sourceView.kanbanAggregateOperationFieldMetadataId
              : undefined,
          type: type ?? sourceView.type,
          objectMetadataId: sourceView.objectMetadataId,
        });

        if (isUndefinedOrNull(newView)) {
          throw new Error('Failed to create view');
        }

        await createViewFieldRecords(sourceView.viewFields, newView);

        if (type === ViewType.Kanban) {
          if (!isDefined(kanbanFieldMetadataId)) {
            throw new Error('Kanban view must have a kanban field');
          }

          const viewGroupsToCreate =
            objectMetadataItem.fields
              ?.find((field) => field.id === kanbanFieldMetadataId)
              ?.options?.map(
                (option, index) =>
                  ({
                    id: v4(),
                    __typename: 'ViewGroup',
                    fieldMetadataId: kanbanFieldMetadataId,
                    fieldValue: option.value,
                    isVisible: true,
                    position: index,
                  }) satisfies ViewGroup,
              ) ?? [];

          viewGroupsToCreate.push({
            __typename: 'ViewGroup',
            id: v4(),
            fieldValue: '',
            position: viewGroupsToCreate.length,
            isVisible: true,
            fieldMetadataId: kanbanFieldMetadataId,
          } satisfies ViewGroup);

          await createViewGroupRecords({
            viewGroupsToCreate,
            viewId: newView.id,
          });
        }

        if (shouldCopyFiltersAndSortsAndAggregate === true) {
          const viewFilterGroupsToCopy = currentRecordFilterGroups.map(
            (recordFilterGroup) =>
              mapRecordFilterGroupToViewFilterGroup({
                recordFilterGroup,
                view: newView,
              }),
          );

          const oldViewFilterGroupIdToNewViewFilterGroupIdMap = new Map<
            string,
            string
          >();

          for (const viewFilterGroupToCopy of viewFilterGroupsToCopy) {
            oldViewFilterGroupIdToNewViewFilterGroupIdMap.set(
              viewFilterGroupToCopy.id,
              v4(),
            );
          }

          const viewFilterGroupsToCreate = currentRecordFilterGroups
            .map((recordFilterGroup) =>
              mapRecordFilterGroupToViewFilterGroup({
                recordFilterGroup,
                view: newView,
              }),
            )
            .map((viewFilterGroup) => {
              const newViewFilterGroupId =
                oldViewFilterGroupIdToNewViewFilterGroupIdMap.get(
                  viewFilterGroup.id,
                );

              if (!isDefined(newViewFilterGroupId)) {
                throw new Error(
                  `Failed to find view filter group to copy for id ${viewFilterGroup.id} this shouldn't happen`,
                );
              }

              const parentViewFilterGroupIdToCopy =
                viewFilterGroup.parentViewFilterGroupId;

              const newParentViewFilterGroupId = isDefined(
                parentViewFilterGroupIdToCopy,
              )
                ? oldViewFilterGroupIdToNewViewFilterGroupIdMap.get(
                    parentViewFilterGroupIdToCopy,
                  )
                : undefined;

              const newViewFilterGroup = {
                ...viewFilterGroup,
                id: newViewFilterGroupId,
                parentViewFilterGroupId: newParentViewFilterGroupId,
              } satisfies ViewFilterGroup;

              return newViewFilterGroup;
            });

          const viewFiltersToCreate = currentRecordFilters
            .map(mapRecordFilterToViewFilter)
            .map((viewFilter) => {
              const parentViewFilterGroupIdToCopy =
                viewFilter.viewFilterGroupId;

              const newParentViewFilterGroupId = isDefined(
                parentViewFilterGroupIdToCopy,
              )
                ? oldViewFilterGroupIdToNewViewFilterGroupIdMap.get(
                    parentViewFilterGroupIdToCopy,
                  )
                : undefined;

              return {
                ...viewFilter,
                id: v4(),
                viewFilterGroupId: newParentViewFilterGroupId,
              } satisfies ViewFilter;
            });

          const viewSortsToCreate = currentRecordSorts
            .map(mapRecordSortToViewSort)
            .map(
              (viewSort) =>
                ({
                  ...viewSort,
                  id: v4(),
                }) satisfies ViewSort,
            );

          await createViewSortRecords(viewSortsToCreate, newView);
          await createViewFilterRecords(viewFiltersToCreate, newView);
          await createViewFilterGroupRecords(viewFilterGroupsToCreate, newView);
        }

        await findManyRecords();
        set(isPersistingViewFieldsState, false);
      },
    [
      currentViewIdCallbackState,
      createOneRecord,
      createViewFieldRecords,
      findManyRecords,
      objectMetadataItem.fields,
      createViewGroupRecords,
      createViewSortRecords,
      createViewFilterRecords,
      createViewFilterGroupRecords,
      currentRecordFilters,
      currentRecordSorts,
      currentRecordFilterGroups,
    ],
  );

  return { createViewFromCurrentView };
};
