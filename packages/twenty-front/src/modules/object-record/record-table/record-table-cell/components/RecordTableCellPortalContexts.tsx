import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellPortalContexts = ({
  position,
  children,
}: {
  position: TableCellPosition;
  children: React.ReactNode;
}) => {
  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const recordId = allRecordIds.at(position.row);

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: recordId ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  if (!isDefined(recordId)) {
    return null;
  }

  const recordField = visibleRecordFields[position.column];

  if (!isDefined(recordField)) {
    return null;
  }

  return (
    <RecordTableRowContextProvider
      value={{
        recordId,
        rowIndex: position.row,
        isSelected: false,
        pathToShowPage:
          getBasePathToShowPage({
            objectNameSingular: objectMetadataItem.nameSingular,
          }) + recordId,
        objectNameSingular: objectMetadataItem.nameSingular,
        isRecordReadOnly,
      }}
    >
      <RecordTableCellContext.Provider
        value={{
          recordField,
          cellPosition: position,
        }}
      >
        <RecordTableCellFieldContextWrapper recordField={recordField}>
          {children}
        </RecordTableCellFieldContextWrapper>
      </RecordTableCellContext.Provider>
    </RecordTableRowContextProvider>
  );
};
