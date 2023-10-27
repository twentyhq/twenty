import { useRecoilCallback } from 'recoil';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Filter } from '@/ui/data/filter/types/Filter';
import { Sort } from '@/ui/data/sort/types/Sort';
import {
  SortOrder,
  useGetViewFieldsQuery,
  useGetViewFiltersQuery,
  useGetViewSortsQuery,
  useGetViewsQuery,
} from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useView } from '../hooks/useView';
import { useViewInternalStates } from '../hooks/useViewInternalStates';
import { availableFieldsScopedState } from '../states/availableFieldsScopedState';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { savedViewFieldsScopedFamilyState } from '../states/savedViewFieldsScopedFamilyState';
import { savedViewFiltersScopedFamilyState } from '../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { viewsScopedState } from '../states/viewsScopedState';

export const ViewBarEffect = () => {
  const {
    scopeId: viewScopeId,
    setCurrentViewFields,
    setSavedViewFields,
    setCurrentViewSorts,
    setSavedViewSorts,
    setCurrentViewFilters,
    setSavedViewFilters,
    currentViewId,
    setViews,
    setCurrentViewId,
  } = useView();

  const { viewType, viewObjectId } = useViewInternalStates(viewScopeId);

  useGetViewFieldsQuery({
    skip: !currentViewId,
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: useRecoilCallback(({ snapshot }) => async (data) => {
      const availableFields = snapshot
        .getLoadable(availableFieldsScopedState({ scopeId: viewScopeId }))
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

      const queriedViewFields = data.viewFields
        .map<ColumnDefinition<FieldMetadata> | null>((viewField) => {
          const columnDefinition = availableFields.find(
            ({ key }) => viewField.key === key,
          );

          return columnDefinition
            ? {
                ...columnDefinition,
                key: viewField.key,
                name: viewField.name,
                index: viewField.index,
                size: viewField.size ?? columnDefinition.size,
                isVisible: viewField.isVisible,
              }
            : null;
        })
        .filter<ColumnDefinition<FieldMetadata>>(assertNotNull);

      if (!isDeeplyEqual(savedViewFields, queriedViewFields)) {
        setCurrentViewFields?.(queriedViewFields);
        setSavedViewFields?.(queriedViewFields);
      }
    }),
  });

  useGetViewsQuery({
    variables: {
      where: {
        objectId: { equals: viewObjectId },
        type: { equals: viewType },
      },
    },
    onCompleted: useRecoilCallback(({ snapshot }) => async (data) => {
      const nextViews = data.views.map((view) => ({
        id: view.id,
        name: view.name,
      }));
      const views = snapshot
        .getLoadable(viewsScopedState({ scopeId: viewScopeId }))
        .getValue();

      if (!isDeeplyEqual(views, nextViews)) setViews(nextViews);

      if (!nextViews.length) return;

      if (!currentViewId) return setCurrentViewId(nextViews[0].id);
    }),
  });

  useGetViewSortsQuery({
    skip: !currentViewId,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: useRecoilCallback(({ snapshot }) => async (data) => {
      const availableSorts = snapshot
        .getLoadable(availableSortsScopedState({ scopeId: viewScopeId }))
        .getValue();

      if (!availableSorts || !currentViewId) {
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

      const queriedViewSorts = data.viewSorts
        .map((viewSort) => {
          const foundCorrespondingSortDefinition = availableSorts.find(
            (sort) => sort.key === viewSort.key,
          );

          if (foundCorrespondingSortDefinition) {
            return {
              key: viewSort.key,
              definition: foundCorrespondingSortDefinition,
              direction: viewSort.direction.toLowerCase(),
            } as Sort;
          } else {
            return undefined;
          }
        })
        .filter((sort): sort is Sort => !!sort);

      if (!isDeeplyEqual(savedViewSorts, queriedViewSorts)) {
        setSavedViewSorts?.(queriedViewSorts);
        setCurrentViewSorts?.(queriedViewSorts);
      }
    }),
  });

  useGetViewFiltersQuery({
    skip: !currentViewId,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: useRecoilCallback(({ snapshot }) => (data) => {
      const availableFilters = snapshot
        .getLoadable(availableFiltersScopedState({ scopeId: viewScopeId }))
        .getValue();

      if (!availableFilters || !currentViewId) {
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

      const queriedViewFilters = data.viewFilters
        .map(({ __typename, name: _name, ...viewFilter }) => {
          const availableFilter = availableFilters.find(
            (filter) => filter.key === viewFilter.key,
          );

          return availableFilter
            ? {
                ...viewFilter,
                displayValue: viewFilter.displayValue ?? viewFilter.value,
                type: availableFilter.type,
              }
            : undefined;
        })
        .filter((filter): filter is Filter => !!filter);

      if (!isDeeplyEqual(savedViewFilters, queriedViewFilters)) {
        setSavedViewFilters?.(queriedViewFilters);
        setCurrentViewFilters?.(queriedViewFilters);
      }
    }),
  });

  return <></>;
};
