import { styled } from '@linaria/react';
import { useContext, type ReactNode } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldIdentifierDisplay } from '@/object-record/record-field/ui/meta-types/display/utils/isFieldIdentifierDisplay';
import { RECORD_CHIP_CLICK_OUTSIDE_ID } from '@/object-record/record-table/constants/RecordChipClickOutsideId';
import { RECORD_TABLE_CELL_CONTENT_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellContentClassName';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { useTheme } from 'twenty-ui/theme';

const StyledBaseContainer = styled.div<{
  fontColorMedium: string;
  backgroundColorSecondary: string;
  fontColorSecondary: string;
  isReadOnly: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  position: relative;

  user-select: none;

  @media (hover: hover) {
    &:hover {
      background-color: ${({ isReadOnly, backgroundColorSecondary }) =>
        isReadOnly ? backgroundColorSecondary : 'unset'};
      border-radius: ${({ isReadOnly }) => (isReadOnly ? '0px' : 'unset')};
      color: ${({ isReadOnly, fontColorSecondary }) =>
        isReadOnly ? fontColorSecondary : 'unset'};
      outline: ${({ isReadOnly, fontColorMedium }) =>
        isReadOnly ? `1px solid ${fontColorMedium}` : 'unset'};
    }

    &[data-read-only]:hover img {
      opacity: 0.64;
    }
  }
`;

export const RecordTableCellBaseContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    isRecordFieldReadOnly: isReadOnly,
    fieldDefinition,
    isLabelIdentifier,
  } = useContext(FieldContext);
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const theme = useTheme();

  const { columnIndex } = useContext(RecordTableCellContext);
  const { recordId } = useRecordTableRowContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const isChipDisplay = isFieldIdentifierDisplay(
    fieldDefinition,
    isLabelIdentifier,
  );

  const handleContainerClick = () => {
    openTableCell();
  };

  return (
    <StyledBaseContainer
      className={RECORD_TABLE_CELL_CONTENT_CLASS_NAME}
      onClick={handleContainerClick}
      backgroundColorSecondary={theme.background.secondary}
      fontColorSecondary={theme.font.color.secondary}
      fontColorMedium={theme.border.color.medium}
      isReadOnly={isReadOnly ?? false}
      data-read-only={isReadOnly || undefined}
      id={getRecordTableCellId({ recordTableId, columnIndex, recordId })}
      data-record-table-col={columnIndex}
      data-record-table-record-id={recordId}
      data-click-outside-id={
        isChipDisplay ? RECORD_CHIP_CLICK_OUTSIDE_ID : undefined
      }
    >
      {children}
    </StyledBaseContainer>
  );
};
