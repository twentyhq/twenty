import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { IconGripVertical, IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledPlaceholderContainer = styled.div<{ isEmpty?: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4)};

  &:hover {
    cursor: ${({ isEmpty }) => (isEmpty ? 'pointer' : 'default')};
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

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

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
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
  if (isEmpty) {
    return (
      <StyledPlaceholderContainer isEmpty>
        <StyledHeader>
          <IconButton
            Icon={IconGripVertical}
            variant="tertiary"
            size="small"
            disabled
          />
          <StyledTitle>Add Widget</StyledTitle>
        </StyledHeader>
        <AnimatedPlaceholderEmptyContainer
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
        >
          <AnimatedPlaceholder type="noWidgets" />
          <AnimatedPlaceholderEmptyTextContainer>
            <AnimatedPlaceholderEmptyTitle>
              No widgets yet
            </AnimatedPlaceholderEmptyTitle>
            <AnimatedPlaceholderEmptySubTitle>
              Click to add your first widget
            </AnimatedPlaceholderEmptySubTitle>
          </AnimatedPlaceholderEmptyTextContainer>
        </AnimatedPlaceholderEmptyContainer>
      </StyledPlaceholderContainer>
    );
  }

  return (
    <StyledPlaceholderContainer>
      <StyledHeader>
        <StyledDragHandleButton
          Icon={IconGripVertical}
          className="drag-handle"
          variant="tertiary"
          size="small"
        />
        <StyledTitle>{title}</StyledTitle>
        {onRemove && (
          <IconButton
            onClick={onRemove}
            Icon={IconX}
            variant="tertiary"
            size="small"
          />
        )}
      </StyledHeader>
      <StyledContent>{children}</StyledContent>
    </StyledPlaceholderContainer>
  );
};
