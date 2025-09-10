import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import {
  DEFAULT_RECORD_TABLE_TD_WIDTH,
  StyledTd,
} from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useContext, type ReactNode } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

const StyledRecordTableTd = styled(StyledTd)<{ zIndex: number }>`
  z-index: ${({ zIndex }) => zIndex};
`;

export const RecordTableCellFirstRowFirstColumn = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = true,
  hasBottomBorder = true,
  width = DEFAULT_RECORD_TABLE_TD_WIDTH,
  ...dragHandleProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  width?: number;
} & (Partial<DraggableProvidedDragHandleProps> | null)) => {
  const { theme } = useContext(ThemeContext);

  const [isRecordTableScrolledVertically] = useRecoilComponentState(
    isRecordTableScrolledVerticallyComponentState,
  );

  const zIndex = isRecordTableScrolledVertically
    ? TABLE_Z_INDEX.firstCellWithVerticalScroll
    : TABLE_Z_INDEX.firstCellWithoutVerticalScroll;

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  const borderColor = theme.border.color.light;

  const fontColor = theme.font.color.primary;

  return (
    <StyledRecordTableTd
      isDragging={isDragging}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      width={width}
      zIndex={zIndex}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      className="table-cell-0-0"
    >
      {children}
    </StyledRecordTableTd>
  );
};
