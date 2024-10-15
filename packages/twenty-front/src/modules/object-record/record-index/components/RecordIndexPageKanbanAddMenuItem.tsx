import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
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
            columnDefinition.type === RecordGroupDefinitionType.Value
              ? 'solid'
              : 'outline'
          }
          color={
            columnDefinition.type === RecordGroupDefinitionType.Value
              ? columnDefinition.color
              : 'transparent'
          }
          text={columnDefinition.title}
          weight={
            columnDefinition.type === RecordGroupDefinitionType.Value
              ? 'regular'
              : 'medium'
          }
        />
      }
      onClick={() => onItemClick(columnDefinition)}
    />
  );
};
