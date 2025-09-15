import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroupRecords';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { isPersistingViewFieldsState } from '@/views/states/isPersistingViewFieldsState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewGroup } from '@/views/types/ViewGroup';
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
import {
  type CreateCoreViewFieldMutationVariables,
  useCreateCoreViewMutation,
} from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateViewFromCurrentView = (viewBarComponentId?: string) => {
  const [createCoreViewMutation] = useCreateCoreViewMutation();
  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
    viewBarComponentId,
  );

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const { createViewFieldRecords } = usePersistViewFieldRecords();

  const { createViewSortRecords } = usePersistViewSortRecords();

  const { createViewGroupRecords } = usePersistViewGroupRecords();

  const { createViewFilterRecords } = usePersistViewFilterRecords();

  const { createViewFilterGroupRecords } = usePersistViewFilterGroupRecords();

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
    ({ snapshot, set }) =>
      async (
        {
          id,
          name,
          icon,
          kanbanFieldMetadataId,
          calendarFieldMetadataId,
          type,
        }: Partial<
          Pick<
            GraphQLView,
            | 'id'
            | 'name'
            | 'icon'
            | 'kanbanFieldMetadataId'
            | 'calendarFieldMetadataId'
            | 'type'
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

        set(isPersistingViewFieldsState, true);

        const viewType = type ?? sourceView.type;

        const result = await createCoreViewMutation({
          variables: {
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
            },
          },
        });
        const newViewId = result.data?.createCoreView.id;

        if (isUndefinedOrNull(newViewId)) {
          throw new Error('Failed to create view');
        }

        await createViewFieldRecords(
          sourceView.viewFields.map<CreateCoreViewFieldMutationVariables>(
            ({ __typename, ...viewField }) => ({
              input: { ...viewField, viewId: newViewId },
            }),
          ),
        );

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
            viewId: newViewId,
          });
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

          await createViewFilterGroupRecords(viewFilterGroupsToCreate, {
            id: newViewId,
          });
          await createViewFilterRecords(viewFiltersToCreate, { id: newViewId });
          await createViewSortRecords(viewSortsToCreate, { id: newViewId });
        }

        await refreshCoreViewsByObjectMetadataId(objectMetadataItem.id);

        set(isPersistingViewFieldsState, false);
        return newViewId;
      },
    [
      currentViewIdCallbackState,
      createViewFieldRecords,
      createCoreViewMutation,
      anyFieldFilterValue,
      objectMetadataItem.fields,
      objectMetadataItem.id,
      createViewGroupRecords,
      currentRecordFilterGroups,
      currentRecordFilters,
      currentRecordSorts,
      createViewFilterGroupRecords,
      createViewFilterRecords,
      createViewSortRecords,
      refreshCoreViewsByObjectMetadataId,
    ],
  );

  return { createViewFromCurrentView };
};
