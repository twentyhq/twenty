import styled from '@emotion/styled';
import { IconGripVertical, IconPencil, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDragHandleButton = styled(IconButton)`
  cursor: grab;
  display: flex;
  align-items: center;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  user-select: none;
`;

type WidgetHeaderProps = {
  displayDragHandle: boolean;
  isEmpty?: boolean;
  title: string;
  onRemove?: () => void;
  onEdit?: () => void;
};

export const WidgetHeader = ({
  displayDragHandle = false,
  isEmpty = false,
  title,
  onEdit,
  onRemove,
}: WidgetHeaderProps) => {
  return (
    <StyledHeader>
      {displayDragHandle && (
        <StyledDragHandleButton
          Icon={IconGripVertical}
          className="drag-handle"
          variant="tertiary"
          size="small"
          disabled={isEmpty}
        />
      )}
      <StyledTitle>{isEmpty ? 'Add Widget' : title}</StyledTitle>
      {!isEmpty && onEdit && (
        <IconButton
          onClick={onEdit}
          Icon={IconPencil}
          variant="tertiary"
          size="small"
        />
      )}
      {!isEmpty && onRemove && (
        <IconButton
          onClick={onRemove}
          Icon={IconX}
          variant="tertiary"
          size="small"
        />
      )}
    </StyledHeader>
  );
};
