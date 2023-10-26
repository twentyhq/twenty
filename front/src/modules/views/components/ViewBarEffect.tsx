import { useRecoilCallback } from 'recoil';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import {
  SortOrder,
  useGetViewFieldsQuery,
  useGetViewsQuery,
} from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useView } from '../hooks/useView';
import { availableFieldsScopedState } from '../states/availableFieldsScopedState';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { viewsScopedState } from '../states/viewsScopedState';

export const ViewBarEffect = () => {
  const viewScopeId = 'company-table';
  const {
    setCurrentViewFields,
    currentViewId,
    viewObjectId,
    viewType,
    setViews,
    setCurrentViewId,
  } = useView({
    viewScopeId: viewScopeId,
  });

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

      const currentViewFields = snapshot
        .getLoadable(
          currentViewFieldsScopedFamilyState({
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

      if (!isDeeplyEqual(currentViewFields, queriedViewFields)) {
        setCurrentViewFields?.(queriedViewFields);
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

  return <></>;
};
