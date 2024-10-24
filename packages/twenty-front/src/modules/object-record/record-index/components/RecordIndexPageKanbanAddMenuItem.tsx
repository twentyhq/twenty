import { RecordBoardColumnDefinitionType } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { useRecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/hooks/useRecordIndexPageKanbanAddMenuItem';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import styled from '@emotion/styled';
import { Tag } from 'twenty-ui';

const StyledMenuItem = styled(MenuItem)`
  width: calc(100% - 2 * var(--horizontal-padding));
`;

type RecordIndexPageKanbanAddMenuItemProps = {
  columnId: string;
  recordIndexId: string;
  onItemClick: (columnDefinition: any) => void;
};

export const RecordIndexPageKanbanAddMenuItem = ({
  columnId,
  recordIndexId,
  onItemClick,
}: RecordIndexPageKanbanAddMenuItemProps) => {
  const { columnDefinition } = useRecordIndexPageKanbanAddMenuItem(
    recordIndexId,
    columnId,
  );
  if (!columnDefinition) {
    return null;
  }

  return (
    <StyledMenuItem
      text={
        <Tag
          variant={
            columnDefinition.type === RecordBoardColumnDefinitionType.Value
              ? 'solid'
              : 'outline'
          }
          color={
            columnDefinition.type === RecordBoardColumnDefinitionType.Value
              ? columnDefinition.color
              : 'transparent'
          }
          text={columnDefinition.title}
          weight={
            columnDefinition.type === RecordBoardColumnDefinitionType.Value
              ? 'regular'
              : 'medium'
          }
        />
      }
      onClick={() => onItemClick(columnDefinition)}
    />
  );
};
