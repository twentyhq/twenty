import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import type {
  ViewFieldMetadata,
  ViewFieldTextMetadata,
} from '@/ui/editable-field/types/ViewField';
import { availableTableColumnsScopedState } from '@/ui/table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '@/ui/table/states/savedTableColumnsScopedState';
import { savedTableColumnsByIdScopedSelector } from '@/ui/table/states/selectors/savedTableColumnsByIdScopedSelector';
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
  objectName: 'company' | 'person',
  fieldDefinition: ColumnDefinition<ViewFieldMetadata>,
) => ({
  fieldName: fieldDefinition.label,
  index: fieldDefinition.order,
  isVisible: fieldDefinition.isVisible ?? true,
  objectName,
  sizeInPx: fieldDefinition.size,
});

export const useTableViewFields = ({
  objectName,
  columnDefinitions,
}: {
  objectName: 'company' | 'person';
  columnDefinitions: ColumnDefinition<ViewFieldMetadata>[];
}) => {
  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const [availableColumns, setAvailableColumns] = useRecoilScopedState(
    availableTableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const [columns, setColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const setSavedColumns = useSetRecoilState(
    savedTableColumnsScopedState(currentViewId),
  );
  const savedColumnsById = useRecoilValue(
    savedTableColumnsByIdScopedSelector(currentViewId),
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
            ...toViewFieldInput(objectName, column),
            viewId,
          })),
        },
      });
    },
    [createViewFieldsMutation, currentViewId, objectName],
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
                sizeInPx: column.size,
              },
              where: { id: column.id },
            },
          }),
        ),
      );
    },
    [currentViewId, updateViewFieldMutation],
  );

  const { refetch } = useGetViewFieldsQuery({
    skip: !currentViewId,
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        objectName: { equals: objectName },
        viewId: { equals: currentViewId ?? null },
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
        ...(columnDefinitions.find(
          ({ label: columnLabel }) => viewField.fieldName === columnLabel,
        ) || { metadata: DEFAULT_VIEW_FIELD_METADATA }),
        id: viewField.id,
        label: viewField.fieldName,
        order: viewField.index,
        size: viewField.sizeInPx,
        isVisible: viewField.isVisible,
      }));

      if (!isDeeplyEqual(columns, nextColumns)) {
        setSavedColumns(nextColumns);
        setColumns(nextColumns);
      }

      if (!availableColumns.length) {
        setAvailableColumns(columnDefinitions);
      }
    },
  });

  const persistColumns = useCallback(async () => {
    if (!currentViewId) return;

    const viewFieldsToCreate = columns.filter(
      (column) => !savedColumnsById[column.id],
    );
    await createViewFields(viewFieldsToCreate);

    const viewFieldsToUpdate = columns.filter(
      (column) =>
        savedColumnsById[column.id] &&
        (savedColumnsById[column.id].size !== column.size ||
          savedColumnsById[column.id].isVisible !== column.isVisible),
    );
    await updateViewFields(viewFieldsToUpdate);

    return refetch();
  }, [
    columns,
    createViewFields,
    currentViewId,
    refetch,
    savedColumnsById,
    updateViewFields,
  ]);

  return { createViewFields, persistColumns };
};
