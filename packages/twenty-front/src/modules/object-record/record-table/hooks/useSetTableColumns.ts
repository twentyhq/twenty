import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetTableColumns = () => {
  const setTableColumns = useRecoilCallback(
    ({ snapshot, set }) =>
      (
        columns: ColumnDefinition<FieldMetadata>[],
        recordTableId: string,
        objectMetadataId: string,
      ) => {
        const objectMetadataItems = getSnapshotValue(
          snapshot,
          objectMetadataItemsState,
        );

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === objectMetadataId,
        );

        if (!isDefined(objectMetadataItem)) {
          return;
        }

        const tableColumns = getSnapshotValue(
          snapshot,
          tableColumnsComponentState.atomFamily({
            instanceId: recordTableId,
          }),
        );

        const columnsToSet = columns.filter((column) =>
          objectMetadataItem.readableFields
            .map((field) => field.name)
            .includes(column.metadata.fieldName),
        );

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
