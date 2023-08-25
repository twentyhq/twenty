import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldTextMetadata,
} from '@/ui/editable-field/types/ViewField';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '@/ui/table/states/savedTableColumnsScopedState';
import { savedTableColumnsByIdScopedSelector } from '@/ui/table/states/selectors/savedTableColumnsByIdScopedSelector';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
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
  viewFieldDefinition: ViewFieldDefinition<ViewFieldMetadata>,
) => ({
  fieldName: viewFieldDefinition.columnLabel,
  index: viewFieldDefinition.columnOrder,
  isVisible: viewFieldDefinition.isVisible ?? true,
  objectName,
  sizeInPx: viewFieldDefinition.columnSize,
});

export const useTableViewFields = ({
  objectName,
  viewFieldDefinitions,
}: {
  objectName: 'company' | 'person';
  viewFieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
}) => {
  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
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
      columns: ViewFieldDefinition<ViewFieldMetadata>[],
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
    (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => {
      if (!currentViewId || !columns.length) return;

      return Promise.all(
        columns.map((column) =>
          updateViewFieldMutation({
            variables: {
              data: {
                isVisible: column.isVisible,
                sizeInPx: column.columnSize,
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
        await createViewFields(viewFieldDefinitions);
        return refetch();
      }

      const nextColumns = data.viewFields.map<
        ViewFieldDefinition<ViewFieldMetadata>
      >((viewField) => ({
        ...(viewFieldDefinitions.find(
          ({ columnLabel }) => viewField.fieldName === columnLabel,
        ) || { metadata: DEFAULT_VIEW_FIELD_METADATA }),
        id: viewField.id,
        columnLabel: viewField.fieldName,
        columnOrder: viewField.index,
        columnSize: viewField.sizeInPx,
        isVisible: viewField.isVisible,
      }));

      if (!isDeeplyEqual(columns, nextColumns)) {
        setSavedColumns(nextColumns);
        setColumns(nextColumns);
      }
    },
  });

  const persistColumns = useCallback(async () => {
    if (!currentViewId) return;

    const viewFieldsToUpdate = columns.filter(
      (column) =>
        savedColumnsById[column.id] &&
        (savedColumnsById[column.id].columnSize !== column.columnSize ||
          savedColumnsById[column.id].isVisible !== column.isVisible),
    );
    await updateViewFields(viewFieldsToUpdate);

    return refetch();
  }, [columns, currentViewId, refetch, savedColumnsById, updateViewFields]);

  return { createViewFields, persistColumns };
};
