import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { RestrictedField } from 'twenty-shared/types';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetTableColumns = () => {
  const setTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (
        columns: ColumnDefinition<FieldMetadata>[],
        recordTableId: string,
        objectMetadataId: string,
      ) => {
        const tableColumns = getSnapshotValue(
          snapshot,
          tableColumnsComponentState.atomFamily({
            instanceId: recordTableId,
          }),
        );

        let columnsToSet = columns;

        const restrictedFields = getSnapshotValue(
          snapshot,
          currentUserWorkspaceState,
        )?.objectPermissions?.find(
          (permission) => permission.objectMetadataId === objectMetadataId,
        )?.restrictedFields;

        const restrictedFieldMetadataIds = Object.entries(
          restrictedFields ?? {},
        )
          .filter(
            ([_fieldMetadataId, restrictedField]) =>
              (restrictedField as RestrictedField).canRead === false,
          )
          .map(([fieldMetadataId]) => fieldMetadataId);
        const nonRestrictedColumns = columns.filter(
          (column) =>
            !restrictedFieldMetadataIds?.includes(column.fieldMetadataId),
        );
        columnsToSet = nonRestrictedColumns;

        if (isDeeplyEqual(tableColumns, columnsToSet)) {
          return;
        }
        set(
          tableColumnsComponentState.atomFamily({
            instanceId: recordTableId,
          }),
          columnsToSet,
        );
      },
    [],
  );

  return { setTableColumns };
};
