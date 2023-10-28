import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { useFindManyObjects } from '@/metadata/hooks/useFindManyObjects';
import { PaginatedObjectTypeResults } from '@/metadata/types/PaginatedObjectTypeResults';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useView } from '../hooks/useView';
import { useViewInternalStates } from '../hooks/useViewInternalStates';
import { availableFieldsScopedState } from '../states/availableFieldsScopedState';
import { onViewFieldsChangeScopedState } from '../states/onViewFieldsChangeScopedState';
import { savedViewFieldsScopedFamilyState } from '../states/savedViewFieldsScopedFamilyState';
import { viewsScopedState } from '../states/viewsScopedState';
import { View } from '../types/View';
import { ViewField } from '../types/ViewField';

export const ViewBarEffect = () => {
  const {
    scopeId: viewScopeId,
    setCurrentViewFields,
    setSavedViewFields,
    currentViewId,
    setViews,
    changeView,
    setCurrentViewId,
  } = useView();

  const [searchParams] = useSearchParams();

  const { viewType, viewObjectId } = useViewInternalStates(viewScopeId);

  useFindManyObjects({
    objectNamePlural: 'viewFieldsV2',
    filter: { viewId: { eq: currentViewId } },
    onCompleted: useRecoilCallback(
      ({ snapshot }) =>
        async (data: PaginatedObjectTypeResults<ViewField>) => {
          const availableFields = snapshot
            .getLoadable(availableFieldsScopedState({ scopeId: viewScopeId }))
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

          if (!currentViewId) return changeView(nextViews[0].id);
        },
    ),
  });

  // useGetViewSortsQuery({
  //   skip: !currentViewId,
  //   variables: {
  //     where: {
  //       viewId: { equals: currentViewId },
  //     },
  //   },
  //   onCompleted: useRecoilCallback(({ snapshot }) => async (data) => {
  //     const availableSorts = snapshot
  //       .getLoadable(availableSortsScopedState({ scopeId: viewScopeId }))
  //       .getValue();

  //     if (!availableSorts || !currentViewId) {
  //       return;
  //     }

  //     const savedViewSorts = snapshot
  //       .getLoadable(
  //         savedViewSortsScopedFamilyState({
  //           scopeId: viewScopeId,
  //           familyKey: currentViewId,
  //         }),
  //       )
  //       .getValue();

  //     const queriedViewSorts = data.viewSorts
  //       .map((viewSort) => {
  //         const foundCorrespondingSortDefinition = availableSorts.find(
  //           (sort) => sort.key === viewSort.key,
  //         );

  //         if (foundCorrespondingSortDefinition) {
  //           return {
  //             key: viewSort.key,
  //             definition: foundCorrespondingSortDefinition,
  //             direction: viewSort.direction.toLowerCase(),
  //           } as Sort;
  //         } else {
  //           return undefined;
  //         }
  //       })
  //       .filter((sort): sort is Sort => !!sort);

  //     if (!isDeeplyEqual(savedViewSorts, queriedViewSorts)) {
  //       setSavedViewSorts?.(queriedViewSorts);
  //       setCurrentViewSorts?.(queriedViewSorts);
  //     }
  //   }),
  // });

  // useGetViewFiltersQuery({
  //   skip: !currentViewId,
  //   variables: {
  //     where: {
  //       viewId: { equals: currentViewId },
  //     },
  //   },
  //   onCompleted: useRecoilCallback(({ snapshot }) => (data) => {
  //     const availableFilters = snapshot
  //       .getLoadable(availableFiltersScopedState({ scopeId: viewScopeId }))
  //       .getValue();

  //     if (!availableFilters || !currentViewId) {
  //       return;
  //     }

  //     const savedViewFilters = snapshot
  //       .getLoadable(
  //         savedViewFiltersScopedFamilyState({
  //           scopeId: viewScopeId,
  //           familyKey: currentViewId,
  //         }),
  //       )
  //       .getValue();

  //     const queriedViewFilters = data.viewFilters
  //       .map(({ __typename, name: _name, ...viewFilter }) => {
  //         const availableFilter = availableFilters.find(
  //           (filter) => filter.key === viewFilter.key,
  //         );

  //         return availableFilter
  //           ? {
  //               ...viewFilter,
  //               displayValue: viewFilter.displayValue ?? viewFilter.value,
  //               type: availableFilter.type,
  //             }
  //           : undefined;
  //       })
  //       .filter((filter): filter is Filter => !!filter);

  //     if (!isDeeplyEqual(savedViewFilters, queriedViewFilters)) {
  //       setSavedViewFilters?.(queriedViewFilters);
  //       setCurrentViewFilters?.(queriedViewFilters);
  //     }
  //   }),
  // });

  const currentViewIdFromUrl = searchParams.get('view');

  useEffect(() => {
    if (!currentViewIdFromUrl) return;
    setCurrentViewId(currentViewIdFromUrl);
  }, [currentViewIdFromUrl, setCurrentViewId]);

  return <></>;
};
