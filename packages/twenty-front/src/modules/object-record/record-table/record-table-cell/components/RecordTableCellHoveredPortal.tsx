import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableNoRecordGroupBodyContextProvider } from '@/object-record/record-table/components/RecordTableNoRecordGroupBodyContextProvider';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { RecordTableCellHoveredPortalContent } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortalContent';
import { hoverPositionComponentState } from '@/object-record/record-table/states/hoverPositionComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import ReactDOM from 'react-dom';

const StyledRecordTableCellHoveredPortal = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const RecordTableCellHoveredPortal = () => {
  const hoverPosition = useRecoilComponentValueV2(hoverPositionComponentState);

  const anchorElement = document.body.querySelector(
    `#record-table-cell-${hoverPosition.column}-${hoverPosition.row}`,
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

  return ReactDOM.createPortal(
    <StyledRecordTableCellHoveredPortal>
      <RecordTableNoRecordGroupBodyContextProvider>
        <RecordTableRowContextProvider
          value={{
            recordId: allRecordIds[hoverPosition.row],
            rowIndex: hoverPosition.row,
            isSelected: false,
            inView: true,
            pathToShowPage: '/',
            objectNameSingular: objectMetadataItem.nameSingular,
          }}
        >
          <RecordTableCellContext.Provider
            value={{
              columnDefinition: visibleTableColumns[hoverPosition.column],
              columnIndex: hoverPosition.column,
              cellPosition: hoverPosition,
            }}
          >
            <RecordTableCellFieldContextWrapper>
              <RecordTableCellHoveredPortalContent />
            </RecordTableCellFieldContextWrapper>
          </RecordTableCellContext.Provider>
        </RecordTableRowContextProvider>
      </RecordTableNoRecordGroupBodyContextProvider>
    </StyledRecordTableCellHoveredPortal>,
    anchorElement,
  );
};
