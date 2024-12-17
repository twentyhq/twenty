import styled from '@emotion/styled';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { useTheme } from '@emotion/react';
import { IconComponent } from 'twenty-ui';

const StyledRecordTableDraggableTr = styled(RecordTableDraggableTr)`
  cursor: pointer;
`;

const StyledIconContainer = styled(RecordTableTd)`
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
  vertical-align: middle;
  padding-top: 3px;
`;

const StyledRecordTableTdTextContainer = styled(RecordTableTd)`
  border-right: none;
  height: 32px;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.md};
  text-align: center;
  vertical-align: middle;
`;

const StyledEmptyTd = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

type RecordTableActionRowProps = {
  draggableId: string;
  draggableIndex: number;
  LeftIcon: IconComponent;
  text: string;
  onClick?: (event?: React.MouseEvent<HTMLTableRowElement>) => void;
};

export const RecordTableActionRow = ({
  draggableId,
  draggableIndex,
  LeftIcon,
  text,
  onClick,
}: RecordTableActionRowProps) => {
  const theme = useTheme();

  const { visibleTableColumns } = useRecordTableContextOrThrow();

  return (
    <StyledRecordTableDraggableTr
      draggableId={draggableId}
      draggableIndex={draggableIndex}
      onClick={onClick}
      isDragDisabled
    >
      <td aria-hidden />
      <StyledIconContainer>
        <LeftIcon size={theme.icon.size.sm} color={theme.font.color.tertiary} />
      </StyledIconContainer>
      <StyledRecordTableTdTextContainer colSpan={visibleTableColumns.length}>
        <StyledText>{text}</StyledText>
      </StyledRecordTableTdTextContainer>
      <StyledEmptyTd />
      <StyledEmptyTd />
    </StyledRecordTableDraggableTr>
  );
};
