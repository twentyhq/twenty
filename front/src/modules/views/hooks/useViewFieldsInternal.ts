import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { useScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContext';
import {
  SortOrder,
  useCreateViewFieldsMutation,
  useGetViewFieldsQuery,
  useUpdateViewFieldMutation,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { GET_VIEW_FIELDS } from '../graphql/queries/getViewFields';
import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

import { useViewStates } from './useViewStates';

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

export const useViewFieldsInternal = (viewScopeId: string) => {
  const {
    currentViewId,
    availableViewFields,
    setAvailableViewFields,
    viewFields,
    setViewFields,
  } = useViewStates(viewScopeId);

  const { onViewFieldsChange } = useScopeInternalContext(
    ViewScopeInternalContext,
  );

  const [previousViewId, setPreviousViewId] = useState<string | undefined>();

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();
  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  const createViewFields = useCallback(
    (
      columns: ColumnDefinition<FieldMetadata>[],
      objectId: string,
      viewId = currentViewId,
    ) => {
      if (!viewId || !columns.length) return;

      return createViewFieldsMutation({
        variables: {
          data: columns.map((column) => ({
            ...toViewFieldInput(objectId, column),
            viewId,
          })),
        },
        refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
      });
    },
    [createViewFieldsMutation, currentViewId],
  );

  const updateViewFields = useCallback(
    (columns: ColumnDefinition<FieldMetadata>[]) => {
      if (!currentViewId || !columns.length) return;

      return Promise.all(
        columns.map((column) =>
          updateViewFieldMutation({
            variables: {
              data: {
                isVisible: column.isVisible,
                size: column.size,
                index: column.index,
              },
              where: {
                viewId_key: { key: column.key, viewId: currentViewId },
              },
            },
          }),
        ),
      );
    },
    [currentViewId, updateViewFieldMutation],
  );

  useGetViewFieldsQuery({
    skip: !currentViewId,
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: async (data) => {
      if (
        previousViewId !== currentViewId &&
        !isDeeplyEqual(tableColumns, nextColumns)
      ) {
        setTableColumns(nextColumns);
        setPreviousViewId(currentViewId);
      }

      if (!availableTableColumns.length) {
        setAvailableTableColumns(columnDefinitions);
      }
    },
  });

  const persistColumns = useCallback(
    async (nextColumns: ColumnDefinition<FieldMetadata>[]) => {
      if (!currentViewId) return;

      const viewFieldsToCreate = nextColumns.filter(
        (column) => !savedTableColumnsByKey[column.key],
      );
      await createViewFields(viewFieldsToCreate);

      const viewFieldsToUpdate = nextColumns.filter(
        (column) =>
          savedTableColumnsByKey[column.key] &&
          (savedTableColumnsByKey[column.key].size !== column.size ||
            savedTableColumnsByKey[column.key].index !== column.index ||
            savedTableColumnsByKey[column.key].isVisible !== column.isVisible),
      );
      await updateViewFields(viewFieldsToUpdate);
    },
    [createViewFields, currentViewId, savedTableColumnsByKey, updateViewFields],
  );

  return { createViewFields, persistColumns };
};
