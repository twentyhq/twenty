import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { GraphQLView } from '@/views/types/GraphQLView';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';
import { useView } from '../hooks/useView';
import { ViewField } from '../types/ViewField';
import { ViewFilter } from '../types/ViewFilter';
import { ViewSort } from '../types/ViewSort';
import { getViewScopedStatesFromSnapshot } from '../utils/getViewScopedStatesFromSnapshot';
import { getViewScopedStateValuesFromSnapshot } from '../utils/getViewScopedStateValuesFromSnapshot';

export const ViewBarEffect = () => {
  const { scopeId: viewScopeId, loadView, changeViewInUrl } = useView();

  const [searchParams] = useSearchParams();
  const currentViewIdFromUrl = searchParams.get('view');

  const { viewTypeState, viewObjectMetadataIdState } = useViewScopedStates();

  const viewType = useRecoilValue(viewTypeState);
  const viewObjectMetadataId = useRecoilValue(viewObjectMetadataIdState);

  useFindManyObjectRecords({
    skip: !viewObjectMetadataId,
    objectNamePlural: 'views',
    filter: {
      type: { eq: viewType },
      objectMetadataId: { eq: viewObjectMetadataId },
    },
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<GraphQLView>) => {
          const nextViews = data.edges.map((view) => ({
            id: view.node.id,
            name: view.node.name,
            objectMetadataId: view.node.objectMetadataId,
          }));

          const { viewsState, currentViewIdState } =
            getViewScopedStatesFromSnapshot({
              snapshot,
              viewScopeId,
            });

          const views = getSnapshotValue(snapshot, viewsState);

          if (!isDeeplyEqual(views, nextViews)) set(viewsState, nextViews);

          const currentView =
            data.edges
              .map((view) => view.node)
              .find((view) => view.id === currentViewIdFromUrl) ??
            data.edges[0]?.node ??
            null;

          if (!currentView) return;

          set(currentViewIdState, currentView.id);

          if (currentView?.viewFields) {
            updateViewFields(currentView.viewFields, currentView.id);
            updateViewFilters(currentView.viewFilters, currentView.id);
            updateViewSorts(currentView.viewSorts, currentView.id);
          }

          if (!nextViews.length) return;
          if (!currentViewIdFromUrl) return changeViewInUrl(nextViews[0].id);
        },
    ),
  });

  const updateViewFields = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        data: PaginatedObjectTypeResults<ViewField>,
        currentViewId: string,
      ) => {
        const {
          availableFieldDefinitions,
          onViewFieldsChange,
          savedViewFields,
          isPersistingView,
        } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId,
          viewId: currentViewId,
        });

        const { savedViewFieldsState, currentViewFieldsState } =
          getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId,
            viewId: currentViewId,
          });

        if (!availableFieldDefinitions) {
          return;
        }

        const queriedViewFields = data.edges
          .map((viewField) => viewField.node)
          .filter(assertNotNull);

        if (isPersistingView) {
          return;
        }

        if (!isDeeplyEqual(savedViewFields, queriedViewFields)) {
          set(currentViewFieldsState, queriedViewFields);
          set(savedViewFieldsState, queriedViewFields);
          onViewFieldsChange?.(queriedViewFields);
        }
      },
    [viewScopeId],
  );

  const updateViewFilters = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        data: PaginatedObjectTypeResults<Required<ViewFilter>>,
        currentViewId: string,
      ) => {
        const {
          availableFilterDefinitions,
          savedViewFilters,
          onViewFiltersChange,
        } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId,
          viewId: currentViewId,
        });

        const { savedViewFiltersState, currentViewFiltersState } =
          getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId,
            viewId: currentViewId,
          });

        if (!availableFilterDefinitions) {
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
  );

  const updateViewSorts = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        data: PaginatedObjectTypeResults<Required<ViewSort>>,
        currentViewId: string,
      ) => {
        const { availableSortDefinitions, savedViewSorts, onViewSortsChange } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
            viewId: currentViewId,
          });

        const { savedViewSortsState, currentViewSortsState } =
          getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId,
            viewId: currentViewId,
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
  );

  useEffect(() => {
    if (!currentViewIdFromUrl) return;

    loadView(currentViewIdFromUrl);
  }, [currentViewIdFromUrl, loadView]);

  return <></>;
};
