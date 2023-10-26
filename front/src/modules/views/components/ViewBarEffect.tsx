import { useRecoilCallback } from 'recoil';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Sort } from '@/ui/data/sort/types/Sort';
import {
  SortOrder,
  useGetViewFieldsQuery,
  useGetViewSortsQuery,
  useGetViewsQuery,
} from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useView } from '../hooks/useView';
import { availableFieldsScopedState } from '../states/availableFieldsScopedState';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { savedViewFieldsScopedFamilyState } from '../states/savedViewFieldsScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { viewsScopedState } from '../states/viewsScopedState';

export const ViewBarEffect = () => {
  const {
    scopeId: viewScopeId,
    setCurrentViewFields,
    setSavedViewFields,
    setCurrentViewSorts,
    setSavedViewSorts,
    currentViewId,
    viewObjectId,
    viewType,
    setViews,
    setCurrentViewId,
  } = useView();

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

  return <></>;
};
