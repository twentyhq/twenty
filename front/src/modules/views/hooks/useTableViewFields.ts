import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldTextMetadata,
} from '@/ui/editable-field/types/ViewField';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import {
  tableColumnsByIdState,
  tableColumnsState,
} from '@/ui/table/states/tableColumnsState';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  SortOrder,
  useCreateViewFieldsMutation,
  useGetViewFieldsQuery,
  useUpdateViewFieldMutation,
} from '~/generated/graphql';

import { GET_VIEW_FIELDS } from '../graphql/queries/getViewFields';

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
  const setColumns = useSetRecoilState(tableColumnsState);
  const columnsById = useRecoilValue(tableColumnsByIdState);

  const [createViewFieldsMutation] = useCreateViewFieldsMutation();
  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  const createViewFields = useCallback(
    (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => {
      if (!columns.length) return;

      return createViewFieldsMutation({
        variables: {
          data: columns.map((column) => ({
            ...toViewFieldInput(objectName, column),
            viewId: currentViewId,
          })),
        },
        refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
      });
    },
    [createViewFieldsMutation, currentViewId, objectName],
  );

  const updateViewFields = useCallback(
    (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => {
      if (!columns.length) return;

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
            refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
          }),
        ),
      );
    },
    [updateViewFieldMutation],
  );

  useGetViewFieldsQuery({
    variables: {
      orderBy: { index: SortOrder.Asc },
      where: {
        objectName: { equals: objectName },
        viewId: { equals: currentViewId ?? null },
      },
    },
    onCompleted: (data) => {
      if (data.viewFields.length) {
        setColumns(
          data.viewFields.map<ViewFieldDefinition<ViewFieldMetadata>>(
            (viewField) => ({
              ...(viewFieldDefinitions.find(
                ({ columnLabel }) => viewField.fieldName === columnLabel,
              ) || { metadata: DEFAULT_VIEW_FIELD_METADATA }),
              id: viewField.id,
              columnLabel: viewField.fieldName,
              columnOrder: viewField.index,
              columnSize: viewField.sizeInPx,
              isVisible: viewField.isVisible,
            }),
          ),
        );

        return;
      }

      // Populate if empty
      createViewFields(viewFieldDefinitions);
    },
  });

  const handleColumnsChange = useCallback(
    async (nextColumns: ViewFieldDefinition<ViewFieldMetadata>[]) => {
      setColumns(nextColumns);

      const viewFieldsToCreate = nextColumns.filter(
        (nextColumn) => !columnsById[nextColumn.id],
      );
      await createViewFields(viewFieldsToCreate);

      const viewFieldsToUpdate = nextColumns.filter(
        (nextColumn) =>
          columnsById[nextColumn.id] &&
          (columnsById[nextColumn.id].columnSize !== nextColumn.columnSize ||
            columnsById[nextColumn.id].isVisible !== nextColumn.isVisible),
      );
      await updateViewFields(viewFieldsToUpdate);
    },
    [columnsById, createViewFields, setColumns, updateViewFields],
  );

  return { handleColumnsChange };
};
