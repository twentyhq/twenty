import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import {
  SortOrder,
  useCreateViewFieldsMutation,
  useGetViewFieldsQuery,
  useUpdateViewFieldMutation,
} from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { GET_VIEW_FIELDS } from '../../graphql/queries/getViewFields';
import { useViewStates } from '../useViewStates';

export const toViewFieldInput = (
  objectId: string,
  fieldDefinition: ColumnDefinition<FieldMetadata>,
) => ({
  key: fieldDefinition.key,
  name: fieldDefinition.name,
  index: fieldDefinition.index,
  isVisible: fieldDefinition.isVisible ?? true,
  objectId,
  size: fieldDefinition.size,
});

export const useViewFields = (viewScopeId: string) => {
  const {
    currentViewId,
    availableFields,
    currentViewFields,
    currentViewFieldsByKey,
    setCurrentViewFields,
    onViewFieldsChange,
  } = useViewStates(viewScopeId);

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();
  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  useGetViewFieldsQuery({
    skip: !currentViewId,
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: async (data) => {
      if (!availableFields) {
        return;
      }

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
        onViewFieldsChange?.(queriedViewFields);
      }
    },
  });

  const _createViewFields = useCallback(
    (
      viewFieldsToCreate: ColumnDefinition<FieldMetadata>[],
      objectId: string,
    ) => {
      if (!currentViewId || !viewFieldsToCreate.length) {
        return;
      }

      return createViewFieldsMutation({
        variables: {
          data: viewFieldsToCreate.map((viewField) => ({
            ...toViewFieldInput(objectId, viewField),
            viewId: currentViewId,
          })),
        },
        refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
      });
    },
    [createViewFieldsMutation, currentViewId],
  );

  const _updateViewFields = useCallback(
    (viewFieldsToUpdate: ColumnDefinition<FieldMetadata>[]) => {
      if (!currentViewId || !viewFieldsToUpdate.length) {
        return;
      }

      return Promise.all(
        viewFieldsToUpdate.map((viewField) =>
          updateViewFieldMutation({
            variables: {
              data: {
                isVisible: viewField.isVisible,
                size: viewField.size,
                index: viewField.index,
              },
              where: {
                viewId_key: { key: viewField.key, viewId: currentViewId },
              },
            },
          }),
        ),
      );
    },
    [currentViewId, updateViewFieldMutation],
  );

  const persistViewFields = useCallback(
    async (
      viewFieldToPersist: ColumnDefinition<FieldMetadata>[],
      objectId: string,
    ) => {
      if (!currentViewId) {
        return;
      }

      if (!currentViewFields || !currentViewFieldsByKey) {
        return;
      }

      const viewFieldsToCreate = viewFieldToPersist.filter(
        (viewField) => !currentViewFieldsByKey[viewField.key],
      );
      await _createViewFields(viewFieldsToCreate, objectId);

      const viewFieldsToUpdate = viewFieldToPersist.filter(
        (viewFieldToPersit) =>
          currentViewFieldsByKey[viewFieldToPersit.key] &&
          (currentViewFieldsByKey[viewFieldToPersit.key].size !==
            viewFieldToPersit.size ||
            currentViewFieldsByKey[viewFieldToPersit.key].index !==
              viewFieldToPersit.index ||
            currentViewFieldsByKey[viewFieldToPersit.key].isVisible !==
              viewFieldToPersit.isVisible),
      );
      await _updateViewFields(viewFieldsToUpdate);
    },
    [
      currentViewId,
      currentViewFields,
      currentViewFieldsByKey,
      _createViewFields,
      _updateViewFields,
    ],
  );

  return { persistViewFields };
};
