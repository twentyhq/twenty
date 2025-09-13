import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div<{ onClick?: () => void }>`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  padding: ${({ theme }) => theme.spacing(4)};

  &:hover {
    cursor: ${({ onClick }) => (isDefined(onClick) ? 'pointer' : 'default')};
    border: 1px solid ${({ theme }) => theme.color.blue};
    background: ${({ theme }) => theme.background.primary};
  }
`;

type WidgetContainerProps = {
  children?: ReactNode;
  onClick?: () => void;
};

export const WidgetContainer = ({
  children,
  onClick,
}: WidgetContainerProps) => {
  return <StyledContainer onClick={onClick}>{children}</StyledContainer>;
};
