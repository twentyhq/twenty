import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';
import { useView } from '../hooks/useView';
import { View } from '../types/View';
import { ViewField } from '../types/ViewField';
import { ViewFilter } from '../types/ViewFilter';
import { ViewSort } from '../types/ViewSort';
import { getViewScopedStatesFromSnapshot } from '../utils/getViewScopedStatesFromSnapshot';
import { getViewScopedStateValuesFromSnapshot } from '../utils/getViewScopedStateValuesFromSnapshot';

export const ViewBarEffect = () => {
  const {
    scopeId: viewScopeId,
    currentViewId,
    loadView,
    changeViewInUrl,
  } = useView();

  const [searchParams] = useSearchParams();
  const currentViewIdFromUrl = searchParams.get('view');

  const { viewTypeState, viewObjectMetadataIdState } = useViewScopedStates();

  const viewType = useRecoilValue(viewTypeState);
  const viewObjectMetadataId = useRecoilValue(viewObjectMetadataIdState);

  useFindManyObjectRecords({
    objectNamePlural: 'viewsV2',
    filter: {
      type: { eq: viewType },
      objectMetadataId: { eq: viewObjectMetadataId },
    },
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<View>) => {
          const nextViews = data.edges.map((view) => ({
            id: view.node.id,
            name: view.node.name,
            objectMetadataId: view.node.objectMetadataId,
          }));

          const { viewsState } = getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId,
          });

          const views = getSnapshotValue(snapshot, viewsState);

          if (!isDeeplyEqual(views, nextViews)) set(viewsState, nextViews);

          if (!nextViews.length) return;

          if (!currentViewIdFromUrl) return changeViewInUrl(nextViews[0].id);
        },
    ),
  });

  useFindManyObjectRecords({
    skip: !currentViewId,
    objectNamePlural: 'viewFieldsV2',
    filter: { view: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<ViewField>) => {
          const {
            availableFieldDefinitions,
            onViewFieldsChange,
            savedViewFields,
            currentViewId,
          } = getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

          const { savedViewFieldsState, currentViewFieldsState } =
            getViewScopedStatesFromSnapshot({
              snapshot,
              viewScopeId,
            });

          if (!availableFieldDefinitions || !currentViewId) {
            return;
          }

          const queriedViewFields = data.edges
            .map((viewField) => viewField.node)
            .filter(assertNotNull);

          if (!isDeeplyEqual(savedViewFields, queriedViewFields)) {
            set(currentViewFieldsState, queriedViewFields);
            set(savedViewFieldsState, queriedViewFields);
            onViewFieldsChange?.(queriedViewFields);
          }
        },
      [viewScopeId],
    ),
  });

  useFindManyObjectRecords({
    skip: !currentViewId,
    objectNamePlural: 'viewFiltersV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<Required<ViewFilter>>) => {
          const {
            availableFilterDefinitions,
            savedViewFilters,
            onViewFiltersChange,
            currentViewId,
          } = getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

          const { savedViewFiltersState, currentViewFiltersState } =
            getViewScopedStatesFromSnapshot({
              snapshot,
              viewScopeId,
            });

          if (!availableFilterDefinitions || !currentViewId) {
            return;
          }

          const queriedViewFilters = data.edges
            .map(({ node }) => {
              const availableFilterDefinition = availableFilterDefinitions.find(
                (filterDefinition) =>
                  filterDefinition.fieldMetadataId === node.fieldMetadataId,
              );

              if (!availableFilterDefinition) return null;

              return {
                ...node,
                displayValue: node.displayValue ?? node.value,
                definition: availableFilterDefinition,
              };
            })
            .filter(assertNotNull);

          if (!isDeeplyEqual(savedViewFilters, queriedViewFilters)) {
            set(savedViewFiltersState, queriedViewFilters);
            set(currentViewFiltersState, queriedViewFilters);
            onViewFiltersChange?.(queriedViewFilters);
          }
        },
      [viewScopeId],
    ),
  });

  useFindManyObjectRecords({
    skip: !currentViewId,
    objectNamePlural: 'viewSortsV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<Required<ViewSort>>) => {
          const {
            availableSortDefinitions,
            savedViewSorts,
            onViewSortsChange,
            currentViewId,
          } = getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

          const { savedViewSortsState, currentViewSortsState } =
            getViewScopedStatesFromSnapshot({
              snapshot,
              viewScopeId,
            });

          if (!availableSortDefinitions || !currentViewId) {
            return;
          }

          const queriedViewSorts = data.edges
            .map(({ node }) => {
              const availableSortDefinition = availableSortDefinitions.find(
                (sort) => sort.fieldMetadataId === node.fieldMetadataId,
              );

              if (!availableSortDefinition) return null;

              return {
                id: node.id,
                fieldMetadataId: node.fieldMetadataId,
                direction: node.direction,
                definition: availableSortDefinition,
              };
            })
            .filter(assertNotNull);

          if (!isDeeplyEqual(savedViewSorts, queriedViewSorts)) {
            set(savedViewSortsState, queriedViewSorts);
            set(currentViewSortsState, queriedViewSorts);
            onViewSortsChange?.(queriedViewSorts);
          }
        },
      [viewScopeId],
    ),
  });

  useEffect(() => {
    if (!currentViewIdFromUrl) return;

    loadView(currentViewIdFromUrl);
  }, [currentViewIdFromUrl, loadView]);

  return <></>;
};
