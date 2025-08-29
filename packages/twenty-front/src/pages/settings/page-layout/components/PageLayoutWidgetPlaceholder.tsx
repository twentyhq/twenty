import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { IconGripVertical, IconX } from 'twenty-ui/display';

const StyledPlaceholderContainer = styled.div<{ $isEmpty?: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid
    ${({ theme, $isEmpty }) =>
      $isEmpty ? theme.border.color.light : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
  ${({ $isEmpty, theme }) =>
    $isEmpty &&
    `
    border-style: dashed;
    cursor: pointer;

    &:hover {
      background: ${theme.background.tertiary};
      border-color: ${theme.border.color.medium};
    }
  `}
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledDragHandle = styled.div`
  cursor: grab;
  display: flex;
  align-items: center;

  &:active {
    cursor: grabbing;
  }
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyText = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type PageLayoutWidgetPlaceholderProps = {
  title?: string;
  onRemove?: () => void;
  children?: ReactNode;
  isEmpty?: boolean;
};

export const PageLayoutWidgetPlaceholder = ({
  title = 'Graph Title',
  onRemove,
  children,
  isEmpty = false,
}: PageLayoutWidgetPlaceholderProps) => {
  const theme = useTheme();

  if (isEmpty) {
    return (
      <StyledPlaceholderContainer $isEmpty={true}>
        <StyledHeader>
          <StyledDragHandle className="drag-handle">
            <IconGripVertical size={16} color={theme.border.color.light} />
          </StyledDragHandle>
          <StyledTitle>Add Widget</StyledTitle>
        </StyledHeader>
        <StyledContent>
          <StyledEmptyState>
            <StyledEmptyText>Click to add a widget</StyledEmptyText>
          </StyledEmptyState>
        </StyledContent>
      </StyledPlaceholderContainer>
    );
  }

  return (
    <StyledPlaceholderContainer>
      <StyledHeader>
        <StyledDragHandle className="drag-handle">
          <IconGripVertical size={16} color={theme.border.color.strong} />
        </StyledDragHandle>
        <StyledTitle>{title}</StyledTitle>
        {onRemove && (
          <StyledCloseButton onClick={onRemove}>
            <IconX size={16} />
          </StyledCloseButton>
        )}
      </StyledHeader>
      <StyledContent>{children}</StyledContent>
    </StyledPlaceholderContainer>
  );
};
