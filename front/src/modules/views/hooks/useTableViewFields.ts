import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { availableTableColumnsScopedState } from '@/ui/table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '@/ui/table/states/savedTableColumnsFamilyState';
import { savedTableColumnsByKeyFamilySelector } from '@/ui/table/states/selectors/savedTableColumnsByKeyFamilySelector';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import {
  SortOrder,
  useCreateViewFieldsMutation,
  useGetViewFieldsQuery,
  useUpdateViewFieldMutation,
} from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { GET_VIEW_FIELDS } from '../graphql/queries/getViewFields';

const toViewFieldInput = (
  objectId: 'company' | 'person',
  fieldDefinition: ColumnDefinition<ViewFieldMetadata>,
) => ({
  key: fieldDefinition.key,
  name: fieldDefinition.name,
  index: fieldDefinition.index,
  isVisible: fieldDefinition.isVisible ?? true,
  objectId,
  size: fieldDefinition.size,
});

export const useTableViewFields = ({
  objectId,
  columnDefinitions,
  skipFetch,
}: {
  objectId: 'company' | 'person';
  columnDefinitions: ColumnDefinition<ViewFieldMetadata>[];
  skipFetch?: boolean;
}) => {
  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    TableRecoilScopeContext,
  );
  const [previousViewId, setPreviousViewId] = useState<string | undefined>();
  const [availableTableColumns, setAvailableTableColumns] =
    useRecoilScopedState(
      availableTableColumnsScopedState,
      TableRecoilScopeContext,
    );
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const setSavedTableColumns = useSetRecoilState(
    savedTableColumnsFamilyState(currentViewId),
  );
  const savedTableColumnsByKey = useRecoilValue(
    savedTableColumnsByKeyFamilySelector(currentViewId),
  );

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();
  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  const createViewFields = useCallback(
    (
      columns: ColumnDefinition<ViewFieldMetadata>[],
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
    [createViewFieldsMutation, currentViewId, objectId],
  );

  const updateViewFields = useCallback(
    (columns: ColumnDefinition<ViewFieldMetadata>[]) => {
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
    skip: !currentViewId || skipFetch,
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: async (data) => {
      if (!data.viewFields.length) {
        // Populate if empty
        return createViewFields(columnDefinitions);
      }

      const nextColumns = data.viewFields
        .map<ColumnDefinition<ViewFieldMetadata> | null>((viewField) => {
          const columnDefinition = columnDefinitions.find(
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
        .filter<ColumnDefinition<ViewFieldMetadata>>(assertNotNull);

      setSavedTableColumns(nextColumns);

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
    async (nextColumns: ColumnDefinition<ViewFieldMetadata>[]) => {
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
