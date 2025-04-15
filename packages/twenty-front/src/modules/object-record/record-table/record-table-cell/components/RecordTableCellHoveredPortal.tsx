import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { hoverPositionComponentState } from '@/object-record/record-table/states/hoverPositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import ReactDOM from 'react-dom';
import { BORDER_COMMON } from 'twenty-ui/theme';

const StyledRecordTableCellHoveredPortal = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

const StyledRecordTableCellHoveredPortalContent = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;

  border-radius: ${BORDER_COMMON.radius.sm};
`;

export const RecordTableCellHoveredPortal = () => {
  const hoverPosition = useRecoilComponentValueV2(hoverPositionComponentState);

  const anchorElement = document.body.querySelector(
    `#record-table-cell-${hoverPosition.column}-${hoverPosition.row}`,
  ) as HTMLElement;

  const isInEditMode = useRecoilComponentFamilyValueV2(
    isTableCellInEditModeComponentFamilyState,
    hoverPosition,
  );

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  //   const isMobile = useIsMobile();

  //   const isFirstColumn = hoverPosition.column === 0;

  //   const showButton =
  //     !isFieldInputOnly &&
  //     !objectMetadataItem.isReadOnly &&
  //     !(isMobile && isFirstColumn);

  if (!anchorElement) {
    return null;
  }

  return ReactDOM.createPortal(
    <StyledRecordTableCellHoveredPortal>
      <RecordTableBodyContextProvider
        value={{
          onOpenTableCell: () => {},
          onMoveFocus: () => {},
          onCloseTableCell: () => {},
          onMoveFocusToCurrentCell: () => {},
          onActionMenuDropdownOpened: () => {},
          onCellMouseEnter: () => {},
        }}
      >
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
              <StyledRecordTableCellHoveredPortalContent>
                {isInEditMode ? (
                  <RecordTableCellEditMode>
                    <RecordTableCellFieldInput />
                  </RecordTableCellEditMode>
                ) : (
                  <>
                    <RecordTableCellDisplayMode>
                      <FieldDisplay />
                    </RecordTableCellDisplayMode>
                    <RecordTableCellEditButton />
                  </>
                )}
              </StyledRecordTableCellHoveredPortalContent>
            </RecordTableCellFieldContextWrapper>
          </RecordTableCellContext.Provider>
        </RecordTableRowContextProvider>
      </RecordTableBodyContextProvider>
    </StyledRecordTableCellHoveredPortal>,
    anchorElement,
  );
};
