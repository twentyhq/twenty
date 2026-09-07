import { RECORD_TABLE_CELL_DISPLAY_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellDisplayClassName';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type Ref } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOuterContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 8px;
  width: 100%;
`;

const StyledInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
`;

const StyledEmptyPlaceholderField = styled.div`
  color: ${themeCssVariables.font.color.light};
  padding-left: 4px;
`;

export type EditableCellDisplayContainerProps = {
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  scrollRef?: Ref<HTMLDivElement>;
  isHovered?: boolean;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  placeholderForEmptyCell?: string;
};

export const RecordTableCellDisplayContainer = ({
  children,
  focus,
  onClick,
  scrollRef,
  onContextMenu,
  placeholderForEmptyCell,
}: React.PropsWithChildren<EditableCellDisplayContainerProps>) => (
  <StyledOuterContainer
    className={RECORD_TABLE_CELL_DISPLAY_CLASS_NAME}
    data-testid={
      focus ? 'editable-cell-focus-mode' : 'editable-cell-display-mode'
    }
    onClick={onClick}
    ref={scrollRef}
    onContextMenu={onContextMenu}
  >
    {placeholderForEmptyCell ? (
      <StyledEmptyPlaceholderField>
        {t`Set ${placeholderForEmptyCell}`}
      </StyledEmptyPlaceholderField>
    ) : (
      <StyledInnerContainer>{children}</StyledInnerContainer>
    )}
  </StyledOuterContainer>
);
