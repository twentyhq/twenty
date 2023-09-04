import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import type {
  ViewFieldMetadata,
  ViewFieldTextMetadata,
} from '@/ui/editable-field/types/ViewField';
import { availableTableColumnsScopedState } from '@/ui/table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '@/ui/table/states/savedTableColumnsScopedState';
import { savedTableColumnsByKeyScopedSelector } from '@/ui/table/states/selectors/savedTableColumnsByKeyScopedSelector';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
import type { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  SortOrder,
  useCreateViewFieldsMutation,
  useGetViewFieldsQuery,
  useUpdateViewFieldMutation,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const DEFAULT_VIEW_FIELD_METADATA: ViewFieldTextMetadata = {
  type: 'text',
  placeHolder: '',
  fieldName: '',
};

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
}: {
  objectId: 'company' | 'person';
  columnDefinitions: ColumnDefinition<ViewFieldMetadata>[];
}) => {
  const currentTableViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
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
    savedTableColumnsScopedState(currentTableViewId),
  );
  const savedTableColumnsByKey = useRecoilValue(
    savedTableColumnsByKeyScopedSelector(currentTableViewId),
  );

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();
  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  const createViewFields = useCallback(
    (
      columns: ColumnDefinition<ViewFieldMetadata>[],
      viewId = currentTableViewId,
    ) => {
      if (!viewId || !columns.length) return;

      return createViewFieldsMutation({
        variables: {
          data: columns.map((column) => ({
            ...toViewFieldInput(objectId, column),
            viewId,
          })),
        },
      });
    },
    [createViewFieldsMutation, currentTableViewId, objectId],
  );

  const updateViewFields = useCallback(
    (columns: ColumnDefinition<ViewFieldMetadata>[]) => {
      if (!currentTableViewId || !columns.length) return;

      return Promise.all(
        columns.map((column) =>
          updateViewFieldMutation({
            variables: {
              data: {
                isVisible: column.isVisible,
                size: column.size,
              },
              where: {
                viewId_key: { key: column.key, viewId: currentTableViewId },
              },
            },
          }),
        ),
      );
    },
    [currentTableViewId, updateViewFieldMutation],
  );

  const { refetch } = useGetViewFieldsQuery({
    skip: !currentTableViewId,
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        objectId: { equals: objectId },
        viewId: { equals: currentTableViewId },
      },
    },
    onCompleted: async (data) => {
      if (!data.viewFields.length) {
        // Populate if empty
        await createViewFields(columnDefinitions);
        return refetch();
      }

      const nextColumns = data.viewFields.map<
        ColumnDefinition<ViewFieldMetadata>
      >((viewField) => ({
        ...(columnDefinitions.find(({ key }) => viewField.key === key) || {
          metadata: DEFAULT_VIEW_FIELD_METADATA,
        }),
        key: viewField.key,
        name: viewField.name,
        index: viewField.index,
        size: viewField.size,
        isVisible: viewField.isVisible,
      }));

      if (!isDeeplyEqual(tableColumns, nextColumns)) {
        setSavedTableColumns(nextColumns);
        setTableColumns(nextColumns);
      }

      if (!availableTableColumns.length) {
        setAvailableTableColumns(columnDefinitions);
      }
    },
  });

  const persistColumns = useCallback(async () => {
    if (!currentTableViewId) return;

    const viewFieldsToCreate = tableColumns.filter(
      (column) => !savedTableColumnsByKey[column.key],
    );
    await createViewFields(viewFieldsToCreate);

    const viewFieldsToUpdate = tableColumns.filter(
      (column) =>
        savedTableColumnsByKey[column.key] &&
        (savedTableColumnsByKey[column.key].size !== column.size ||
          savedTableColumnsByKey[column.key].isVisible !== column.isVisible),
    );
    await updateViewFields(viewFieldsToUpdate);

    return refetch();
  }, [
    createViewFields,
    currentTableViewId,
    refetch,
    savedTableColumnsByKey,
    tableColumns,
    updateViewFields,
  ]);

  return { createViewFields, persistColumns };
};
