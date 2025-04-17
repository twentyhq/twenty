import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import ReactDOM from 'react-dom';

export const RecordTableCellPortalWrapper = ({
  position,
  children,
}: {
  position: TableCellPosition;
  children: React.ReactNode;
}) => {
  const anchorElement = document.body.querySelector(
    `#record-table-cell-${position.column}-${position.row}`,
  ) as HTMLElement;

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  if (!anchorElement) {
    return null;
  }

  const recordId = allRecordIds[position.row];

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
