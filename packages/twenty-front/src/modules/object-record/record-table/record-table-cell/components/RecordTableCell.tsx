// import { styled } from '@linaria/react';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';

// const StyledOuterContainer = styled.div`
//   align-items: center;
//   display: flex;
//   height: 100%;
//   overflow: hidden;
//   padding-left: 8px;
//   width: 100%;
// `;

// const StyledInnerContainer = styled.div`
//   align-items: center;
//   display: flex;
//   height: 100%;
//   overflow: hidden;
//   width: 100%;
//   white-space: nowrap;
// `;

// const StyledEmptyPlaceholderField = withTheme(styled.div<{ theme: Theme }>`
//   color: ${({ theme }) => theme.font.color.light};
//   padding-left: 4px;
// `);

// const StyledBaseContainer = styled.div<{
//   fontColorExtraLight: string;
//   fontColorMedium: string;
//   backgroundColorTransparentSecondary: string;
//   isReadOnly: boolean;
//   borderColorBlue: string;
// }>`
//   align-items: center;
//   box-sizing: border-box;
//   cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
//   display: flex;
//   height: 32px;
//   position: relative;
//   user-select: none;

//   &.focus-active {
//     border-radius: ${BORDER_COMMON.radius.sm};
//     outline: 1px solid ${({ borderColorBlue }) => borderColorBlue};
//   }
// `;

export const RecordTableCell = () => {
  // const { isReadOnly } = useContext(FieldContext);
  // const { setIsFocused } = useFieldFocus();
  // // const { openTableCell } = useOpenRecordTableCellFromCell();
  // const { theme } = useContext(ThemeContext);

  // const { cellPosition } = useContext(RecordTableCellContext);

  // const { onMoveHoverToCurrentCell, onCellMouseEnter } =
  //   useRecordTableBodyContextOrThrow();

  // const handleContainerMouseMove = () => {
  //   setIsFocused(true);
  //   onCellMouseEnter({
  //     cellPosition,
  //   });
  // };

  // const handleContainerMouseLeave = () => {
  //   setIsFocused(false);
  // };

  // const handleContainerClick = () => {
  //   onMoveHoverToCurrentCell(cellPosition);
  //   // openTableCell();
  // };

  // const { recordId } = useContext(FieldContext);

  // const { onActionMenuDropdownOpened } = useRecordTableBodyContextOrThrow();

  // // const { openTableCell } = useOpenRecordTableCellFromCell();

  // // const isFieldInputOnly = useIsFieldInputOnly();

  // const handleActionMenuDropdown = (event: React.MouseEvent) => {
  //   onActionMenuDropdownOpened(event, recordId);
  // };

  // const handleClick = () => {
  //   // if (!isFieldInputOnly && !isReadOnly) {
  //   //   openTableCell();
  //   // }
  // };

  return (
    <div
      // onMouseLeave={handleContainerMouseLeave}
      // onMouseMove={handleContainerMouseMove}
      // onClick={handleContainerClick}
      // backgroundColorTransparentSecondary={
      //   theme.background.transparent.secondary
      // }
      // fontColorExtraLight={theme.font.color.extraLight}
      // fontColorMedium={theme.border.color.medium}
      // borderColorBlue={theme.adaptiveColors.blue4}
      // isReadOnly={/*isReadOnly ?? false*/ false}
      id={`record-table-cell`}
    >
      <div
        data-testid={'editable-cell-display-mode'}
        // onClick={handleClick}
      >
        <div>
          <FieldDisplay />
        </div>
      </div>
    </div>
  );
};
