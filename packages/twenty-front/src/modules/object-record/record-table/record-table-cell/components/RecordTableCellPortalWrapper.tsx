import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/read-only/useIsRecordReadOnly';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import ReactDOM from 'react-dom';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellPortalWrapper = ({
  position,
  children,
}: {
  position: TableCellPosition;
  children: React.ReactNode;
}) => {
  const anchorElement = document.body.querySelector<HTMLAnchorElement>(
    `#record-table-cell-${position.column}-${position.row}`,
  );

  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
  );

  const recordId = allRecordIds.at(position.row);

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: recordId ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  if (!isDefined(anchorElement) || !isDefined(recordId)) {
    return null;
  }

  return ReactDOM.createPortal(
    <RecordTableRowContextProvider
      value={{
        recordId,
        rowIndex: position.row,
        isSelected: false,
        inView: true,
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
          columnDefinition: visibleTableColumns[position.column],
          cellPosition: position,
        }}
      >
        <RecordTableCellFieldContextWrapper>
          {children}
        </RecordTableCellFieldContextWrapper>
      </RecordTableCellContext.Provider>
    </RecordTableRowContextProvider>,
    anchorElement,
  );
};
