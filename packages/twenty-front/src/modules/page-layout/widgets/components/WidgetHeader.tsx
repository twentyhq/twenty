import styled from '@emotion/styled';
import { IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { WidgetGrip } from './WidgetGrip';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(6)};
  flex-shrink: 0;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  user-select: none;
`;

type WidgetHeaderProps = {
  isInEditMode: boolean;
  isEmpty?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
};

export const WidgetHeader = ({
  isEmpty = false,
  isInEditMode = false,
  title,
  onRemove,
}: WidgetHeaderProps) => {
  return (
    <StyledHeader>
      {!isEmpty && isInEditMode && (
        <WidgetGrip
          className="drag-handle"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <StyledTitle>{isEmpty ? 'Add Widget' : title}</StyledTitle>
      {!isEmpty && isInEditMode && onRemove && (
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
