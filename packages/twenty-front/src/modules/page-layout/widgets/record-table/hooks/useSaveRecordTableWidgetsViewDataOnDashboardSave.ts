import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useMapRecordFieldToViewFieldWithCurrentAggregateOperation } from '@/page-layout/widgets/record-table/hooks/useMapRecordFieldToViewFieldWithCurrentAggregateOperation';
import { computeViewFieldsToCreateAndUpdate } from '@/page-layout/widgets/record-table/utils/computeViewFieldsToCreateAndUpdate';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { usePerformViewFilterAPIPersist } from '@/views/hooks/internal/usePerformViewFilterAPIPersist';
import { usePerformViewFilterGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFilterGroupAPIPersist';
import { usePerformViewSortAPIPersist } from '@/views/hooks/internal/usePerformViewSortAPIPersist';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { getViewFilterGroupsToCreate } from '@/views/utils/getViewFilterGroupsToCreate';
import { getViewFilterGroupsToDelete } from '@/views/utils/getViewFilterGroupsToDelete';
import { getViewFilterGroupsToUpdate } from '@/views/utils/getViewFilterGroupsToUpdate';
import { getViewFiltersToCreate } from '@/views/utils/getViewFiltersToCreate';
import { getViewFiltersToDelete } from '@/views/utils/getViewFiltersToDelete';
import { getViewFiltersToUpdate } from '@/views/utils/getViewFiltersToUpdate';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const useSaveRecordTableWidgetsViewDataOnDashboardSave = () => {
  const {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
  } = usePerformViewFilterAPIPersist();

  const {
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDelete,
  } = usePerformViewFilterGroupAPIPersist();

  const {
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
  } = usePerformViewSortAPIPersist();

  const { performViewFieldAPICreate, performViewFieldAPIUpdate } =
    usePerformViewFieldAPIPersist();

  const { mapRecordFieldToViewFieldWithCurrentAggregateOperation } =
    useMapRecordFieldToViewFieldWithCurrentAggregateOperation();

  const store = useStore();

  const saveRecordTableWidgetsViewDataOnDashboardSave = useCallback(
    async (pageLayoutId: string) => {
      const pageLayoutDraft = store.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const views = store.get(viewsSelector.atom);
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const recordTableWidgets = pageLayoutDraft.tabs.flatMap((tab) =>
        tab.widgets.filter(
          (widget) =>
            widget.configuration.configurationType ===
            WidgetConfigurationType.RECORD_TABLE,
        ),
      );

      for (const widget of recordTableWidgets) {
        const configuration = widget.configuration;

        if (!('viewId' in configuration) || !isDefined(configuration.viewId)) {
          continue;
        }

        const viewId = configuration.viewId as string;
        const currentView = views.find((view) => view.id === viewId);

        if (!isDefined(currentView) || !isDefined(widget.objectMetadataId)) {
          continue;
        }

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === widget.objectMetadataId,
        );

        if (!isDefined(objectMetadataItem)) {
          continue;
        }

        const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
          objectMetadataItem.namePlural,
          viewId,
        );

        const currentRecordFilters = store.get(
          currentRecordFiltersComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
        );

        const currentRecordFilterGroups = store.get(
          currentRecordFilterGroupsComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
        );

        const currentRecordSorts = store.get(
          currentRecordSortsComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
        );

        const newViewFilterGroups = currentRecordFilterGroups.map(
          (recordFilterGroup) =>
            mapRecordFilterGroupToViewFilterGroup({
              recordFilterGroup,
              view: currentView,
            }),
        );

        const existingViewFilterGroups = currentView.viewFilterGroups ?? [];

        const viewFilterGroupsToCreate = getViewFilterGroupsToCreate(
          existingViewFilterGroups,
          newViewFilterGroups,
        );
        const viewFilterGroupsToUpdate = getViewFilterGroupsToUpdate(
          existingViewFilterGroups,
          newViewFilterGroups,
        );
        const viewFilterGroupsToDelete = getViewFilterGroupsToDelete(
          existingViewFilterGroups,
          newViewFilterGroups,
        );

        const newViewFilters = currentRecordFilters.map(
          mapRecordFilterToViewFilter,
        );
        const existingViewFilters = currentView.viewFilters ?? [];

        const viewFiltersToCreate = getViewFiltersToCreate(
          existingViewFilters,
          newViewFilters,
        );
        const viewFiltersToUpdate = getViewFiltersToUpdate(
          existingViewFilters,
          newViewFilters,
        );
        const viewFiltersToDelete = getViewFiltersToDelete(
          existingViewFilters,
          newViewFilters,
        );

        const newViewSorts = currentRecordSorts.map(mapRecordSortToViewSort);
        const existingViewSorts = currentView.viewSorts ?? [];

        const viewSortsToCreate = getViewSortsToCreate(
          existingViewSorts,
          newViewSorts,
        );
        const viewSortsToUpdate = getViewSortsToUpdate(
          existingViewSorts,
          newViewSorts,
        );
        const viewSortsToDelete = getViewSortsToDelete(
          existingViewSorts,
          newViewSorts,
        );

        const currentRecordFields = store.get(
          currentRecordFieldsComponentState.atomFamily({
            instanceId: recordIndexId,
          }),
        );

        const newViewFields = currentRecordFields.map(
          mapRecordFieldToViewFieldWithCurrentAggregateOperation,
        );

        const existingViewFields = currentView.viewFields ?? [];

        const { viewFieldsToCreate, viewFieldsToUpdate } =
          computeViewFieldsToCreateAndUpdate({
            newViewFields,
            existingViewFields,
            viewId,
          });

        const hasNoRecordTableWidgetChanges =
          viewFilterGroupsToCreate.length === 0 &&
          viewFilterGroupsToUpdate.length === 0 &&
          viewFilterGroupsToDelete.length === 0 &&
          viewFiltersToCreate.length === 0 &&
          viewFiltersToUpdate.length === 0 &&
          viewFiltersToDelete.length === 0 &&
          viewSortsToCreate.length === 0 &&
          viewSortsToUpdate.length === 0 &&
          viewSortsToDelete.length === 0 &&
          viewFieldsToCreate.length === 0 &&
          viewFieldsToUpdate.length === 0;

        if (hasNoRecordTableWidgetChanges) {
          continue;
        }

        await performViewFilterGroupAPICreate(
          viewFilterGroupsToCreate,
          currentView,
        );
        await performViewFilterGroupAPIUpdate(viewFilterGroupsToUpdate);

        await performViewFilterAPIDelete(
          viewFiltersToDelete.map((viewFilter) => ({
            input: { id: viewFilter.id },
          })),
        );
        await performViewFilterAPIUpdate(
          viewFiltersToUpdate.map((viewFilter) => ({
            input: {
              id: viewFilter.id,
              update: {
                value: viewFilter.value,
                operand: viewFilter.operand,
                positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
                viewFilterGroupId: viewFilter.viewFilterGroupId,
                subFieldName: viewFilter.subFieldName ?? null,
              },
            },
          })),
        );
        await performViewFilterAPICreate(
          viewFiltersToCreate.map((viewFilter) => ({
            input: {
              id: viewFilter.id,
              fieldMetadataId: viewFilter.fieldMetadataId,
              viewId: currentView.id,
              value: viewFilter.value,
              operand: viewFilter.operand,
              viewFilterGroupId: viewFilter.viewFilterGroupId,
              positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
              subFieldName: viewFilter.subFieldName ?? null,
            },
          })),
        );
        await performViewFilterGroupAPIDelete(
          viewFilterGroupsToDelete.map((viewFilterGroup) => viewFilterGroup.id),
        );

        await performViewSortAPICreate(
          viewSortsToCreate.map((viewSort) => ({
            input: {
              id: viewSort.id,
              fieldMetadataId: viewSort.fieldMetadataId,
              viewId: currentView.id,
              direction: viewSort.direction,
            },
          })),
        );
        await performViewSortAPIUpdate(
          viewSortsToUpdate.map((viewSort) => ({
            input: {
              id: viewSort.id,
              update: {
                direction: viewSort.direction,
              },
            },
          })),
        );
        await performViewSortAPIDelete(
          viewSortsToDelete.map((viewSort) => ({
            input: { id: viewSort.id },
          })),
        );

        await Promise.all([
          performViewFieldAPICreate({ inputs: viewFieldsToCreate }),
          performViewFieldAPIUpdate(viewFieldsToUpdate),
        ]);
      }
    },
    [
      store,
      mapRecordFieldToViewFieldWithCurrentAggregateOperation,
      performViewFieldAPICreate,
      performViewFieldAPIUpdate,
      performViewFilterAPICreate,
      performViewFilterAPIUpdate,
      performViewFilterAPIDelete,
      performViewFilterGroupAPICreate,
      performViewFilterGroupAPIUpdate,
      performViewFilterGroupAPIDelete,
      performViewSortAPICreate,
      performViewSortAPIUpdate,
      performViewSortAPIDelete,
    ],
  );

  return { saveRecordTableWidgetsViewDataOnDashboardSave };
};
