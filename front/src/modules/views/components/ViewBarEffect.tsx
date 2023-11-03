import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { useFindManyObjects } from '@/metadata/hooks/useFindManyObjects';
import { PaginatedObjectTypeResults } from '@/metadata/types/PaginatedObjectTypeResults';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useView } from '../hooks/useView';
import { useViewGetStates } from '../hooks/useViewGetStates';
import { availableFieldDefinitionsScopedState } from '../states/availableFieldDefinitionsScopedState';
import { availableFilterDefinitionsScopedState } from '../states/availableFilterDefinitionsScopedState';
import { availableSortDefinitionsScopedState } from '../states/availableSortDefinitionsScopedState';
import { onViewFieldsChangeScopedState } from '../states/onViewFieldsChangeScopedState';
import { onViewFiltersChangeScopedState } from '../states/onViewFiltersChangeScopedState';
import { onViewSortsChangeScopedState } from '../states/onViewSortsChangeScopedState';
import { savedViewFieldsScopedFamilyState } from '../states/savedViewFieldsScopedFamilyState';
import { savedViewFiltersScopedFamilyState } from '../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { viewsScopedState } from '../states/viewsScopedState';
import { View } from '../types/View';
import { ViewField } from '../types/ViewField';
import { ViewFilter } from '../types/ViewFilter';
import { ViewSort } from '../types/ViewSort';

export const ViewBarEffect = () => {
  const {
    scopeId: viewScopeId,
    setCurrentViewFields,
    setSavedViewFields,
    setCurrentViewFilters,
    setSavedViewFilters,
    setCurrentViewSorts,
    setSavedViewSorts,
    currentViewId,
    setViews,
    loadView,
    changeViewInUrl,
    setCurrentViewId,
  } = useView();

  const [searchParams] = useSearchParams();
  const currentViewIdFromUrl = searchParams.get('view');

  const { viewType, viewObjectId } = useViewGetStates(viewScopeId);

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
          const views = snapshot
            .getLoadable(viewsScopedState({ scopeId: viewScopeId }))
            .getValue();

          if (!isDeeplyEqual(views, nextViews)) setViews(nextViews);

          if (!nextViews.length) return;

          if (!currentViewIdFromUrl) return changeViewInUrl(nextViews[0].id);
        },
    ),
  });

  useFindManyObjects({
    objectNamePlural: 'viewFieldsV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot }) =>
        async (data: PaginatedObjectTypeResults<ViewField>) => {
          const availableFields = snapshot
            .getLoadable(
              availableFieldDefinitionsScopedState({ scopeId: viewScopeId }),
            )
            .getValue();

          const onViewFieldsChange = snapshot
            .getLoadable(
              onViewFieldsChangeScopedState({ scopeId: viewScopeId }),
            )
            .getValue();

          if (!availableFields || !currentViewId) {
            return;
          }

          const savedViewFields = snapshot
            .getLoadable(
              savedViewFieldsScopedFamilyState({
                scopeId: viewScopeId,
                familyKey: currentViewId,
              }),
            )
            .getValue();

          const queriedViewFields = data.edges
            .map((viewField) => viewField.node)
            .filter(assertNotNull);

          if (!isDeeplyEqual(savedViewFields, queriedViewFields)) {
            setCurrentViewFields?.(queriedViewFields);
            setSavedViewFields?.(queriedViewFields);
            onViewFieldsChange?.(queriedViewFields);
          }
        },
    ),
  });

  useFindManyObjects({
    objectNamePlural: 'viewFiltersV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot }) =>
        async (data: PaginatedObjectTypeResults<Required<ViewFilter>>) => {
          const availableFilterDefinitions = snapshot
            .getLoadable(
              availableFilterDefinitionsScopedState({ scopeId: viewScopeId }),
            )
            .getValue();

          if (!availableFilterDefinitions || !currentViewId) {
            return;
          }

          const savedViewFilters = snapshot
            .getLoadable(
              savedViewFiltersScopedFamilyState({
                scopeId: viewScopeId,
                familyKey: currentViewId,
              }),
            )
            .getValue();

          const onViewFiltersChange = snapshot
            .getLoadable(
              onViewFiltersChangeScopedState({ scopeId: viewScopeId }),
            )
            .getValue();

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
          const availableSortDefinitions = snapshot
            .getLoadable(
              availableSortDefinitionsScopedState({ scopeId: viewScopeId }),
            )
            .getValue();

          if (!availableSortDefinitions || !currentViewId) {
            return;
          }

          const savedViewSorts = snapshot
            .getLoadable(
              savedViewSortsScopedFamilyState({
                scopeId: viewScopeId,
                familyKey: currentViewId,
              }),
            )
            .getValue();

          const onViewSortsChange = snapshot
            .getLoadable(onViewSortsChangeScopedState({ scopeId: viewScopeId }))
            .getValue();

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

  useEffect(() => {
    if (!currentViewIdFromUrl) return;
    loadView(currentViewIdFromUrl);
  }, [currentViewIdFromUrl, loadView, setCurrentViewId]);

  return <></>;
};
