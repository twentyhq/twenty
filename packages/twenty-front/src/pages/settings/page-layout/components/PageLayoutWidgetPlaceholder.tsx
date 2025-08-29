import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { IconGripVertical, IconX } from 'twenty-ui/display';

const StyledPlaceholderContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
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

type PageLayoutWidgetPlaceholderProps = {
  title?: string;
  onRemove?: () => void;
  children?: ReactNode;
};

export const PageLayoutWidgetPlaceholder = ({
  title = 'Graph Title',
  onRemove,
  children,
}: PageLayoutWidgetPlaceholderProps) => {
  const theme = useTheme();
  return (
    <StyledPlaceholderContainer>
      <StyledHeader>
        <IconGripVertical size={16} color={theme.border.color.strong} />
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
