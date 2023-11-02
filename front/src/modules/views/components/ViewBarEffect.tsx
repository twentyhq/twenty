import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useFindManyObjects } from '@/metadata/hooks/useFindManyObjects';
import { PaginatedObjectTypeResults } from '@/metadata/types/PaginatedObjectTypeResults';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useView } from '../hooks/useView';
import { useViewScopedStates } from '../hooks/useViewScopedStates';
import { View } from '../types/View';
import { ViewField } from '../types/ViewField';
import { ViewFilter } from '../types/ViewFilter';
import { ViewSort } from '../types/ViewSort';
import { getViewScopedStatesFromSnapshot } from '../utils/getViewScopedStatesFromSnapshot';
import { getViewScopedStateValuesFromSnapshot } from '../utils/getViewScopedStateValuesFromSnapshot';

export const ViewBarEffect = () => {
  const {
    scopeId: viewScopeId,
    setSavedViewFields,
    setCurrentViewFilters,
    setSavedViewFilters,
    setCurrentViewSorts,
    setCurrentViewFields,
    setSavedViewSorts,
    currentViewId,
    setViews,
    loadView,
    changeViewInUrl,
    setCurrentViewId,
  } = useView();

  const [searchParams] = useSearchParams();

  const { viewTypeState, viewObjectIdState } = useViewScopedStates({
    customViewScopeId: viewScopeId,
  });

  const viewType = useRecoilValue(viewTypeState);
  const viewObjectId = useRecoilValue(viewObjectIdState);

  useFindManyObjects({
    objectNamePlural: 'viewsV2',
    filter: { type: { eq: viewType }, objectId: { eq: viewObjectId } },
    onCompleted: useRecoilCallback(
      ({ snapshot }) =>
        async (data: PaginatedObjectTypeResults<View>) => {
          const nextViews = data.edges.map((view) => ({
            id: view.node.id,
            name: view.node.name,
            objectId: view.node.objectId,
          }));

          const { viewsState } = getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId,
          });

          const views = getSnapshotValue(snapshot, viewsState);

          if (!isDeeplyEqual(views, nextViews)) setViews(nextViews);

          if (!nextViews.length) return;

          if (!currentViewId) return changeViewInUrl(nextViews[0].id);
        },
    ),
  });

  useFindManyObjects({
    objectNamePlural: 'viewFieldsV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot }) =>
        async (data: PaginatedObjectTypeResults<ViewField>) => {
          const {
            availableFieldDefinitions,
            onViewFieldsChange,
            savedViewFields,
          } = getViewScopedStateValuesFromSnapshot({
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
            setCurrentViewFields?.(queriedViewFields);
            setSavedViewFields?.(queriedViewFields);
            onViewFieldsChange?.(queriedViewFields);
          }
        },
      [currentViewId, setSavedViewFields, setCurrentViewFields, viewScopeId],
    ),
  });

  useFindManyObjects({
    objectNamePlural: 'viewFiltersV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot }) =>
        async (data: PaginatedObjectTypeResults<Required<ViewFilter>>) => {
          const {
            availableFilterDefinitions,
            savedViewFilters,
            onViewFiltersChange,
          } = getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

          if (!availableFilterDefinitions || !currentViewId) {
            return;
          }

          const queriedViewFilters = data.edges
            .map(({ node }) => {
              const availableFilterDefinition = availableFilterDefinitions.find(
                (filterDefinition) => filterDefinition.fieldId === node.fieldId,
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
            setSavedViewFilters?.(queriedViewFilters);
            setCurrentViewFilters?.(queriedViewFilters);
            onViewFiltersChange?.(queriedViewFilters);
          }
        },
    ),
  });

  useFindManyObjects({
    objectNamePlural: 'viewSortsV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot }) =>
        async (data: PaginatedObjectTypeResults<Required<ViewSort>>) => {
          const {
            availableSortDefinitions,
            savedViewSorts,
            onViewSortsChange,
          } = getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

          if (!availableSortDefinitions || !currentViewId) {
            return;
          }

          const queriedViewSorts = data.edges
            .map(({ node }) => {
              const availableSortDefinition = availableSortDefinitions.find(
                (sort) => sort.fieldId === node.fieldId,
              );

              if (!availableSortDefinition) return null;

              return {
                id: node.id,
                fieldId: node.fieldId,
                direction: node.direction,
                definition: availableSortDefinition,
              };
            })
            .filter(assertNotNull);

          if (!isDeeplyEqual(savedViewSorts, queriedViewSorts)) {
            setSavedViewSorts?.(queriedViewSorts);
            setCurrentViewSorts?.(queriedViewSorts);
            onViewSortsChange?.(queriedViewSorts);
          }
        },
    ),
  });

  const currentViewIdFromUrl = searchParams.get('view');

  useEffect(() => {
    if (!currentViewIdFromUrl) return;

    loadView(currentViewIdFromUrl);
  }, [currentViewIdFromUrl, loadView, setCurrentViewId]);

  return <></>;
};
