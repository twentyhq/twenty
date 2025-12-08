import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { usePersistViewField } from '@/views/hooks/internal/usePersistViewField';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilter';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroup';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSort';
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
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateViewFromCurrentView = (viewBarComponentId?: string) => {
  const { createView } = usePersistView();

  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
    viewBarComponentId,
  );

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const { createViewFields } = usePersistViewField();

  const { createViewSorts } = usePersistViewSortRecords();

  const { createViewFilters } = usePersistViewFilterRecords();

  const { createViewFilterGroups } = usePersistViewFilterGroupRecords();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const createViewFromCurrentView = useRecoilCallback(
    ({ snapshot }) =>
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
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        if (!isDefined(currentViewId)) {
          return undefined;
        }

        const sourceView = snapshot
          .getLoadable(
            coreViewFromViewIdFamilySelector({
              viewId: currentViewId,
            }),
          )
          .getValue();

        if (!isDefined(sourceView)) {
          return undefined;
        }

        const viewType = type ?? sourceView.type;

        const result = await createView(
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

        const fieldResult = await createViewFields({
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

          await createViewFilterGroups(viewFilterGroupsToCreate, {
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

          const filterResult = await createViewFilters(createViewFilterInputs);

          if (filterResult.status === 'failed') {
            return undefined;
          }

          await createViewSorts(viewSortsToCreate, { id: newViewId });
        }

        await refreshCoreViewsByObjectMetadataId(objectMetadataItem.id);

        return newViewId;
      },
    [
      currentViewIdCallbackState,
      createView,
      anyFieldFilterValue,
      objectMetadataItem,
      createViewFields,
      refreshCoreViewsByObjectMetadataId,
      currentRecordFilterGroups,
      currentRecordFilters,
      currentRecordSorts,
      createViewFilterGroups,
      createViewFilters,
      createViewSorts,
    ],
  );

  return { createViewFromCurrentView };
};
