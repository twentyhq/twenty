import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { type WidgetCardContext } from '../types/WidgetCardContext';

export type WidgetCardContentProps = {
  children?: ReactNode;
  context?: WidgetCardContext;
  className?: string;
};

const StyledWidgetCardContent = styled.div<{
  context?: WidgetCardContext;
}>`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;

  ${({ theme, context }) => {
    switch (context) {
      case 'dashboard':
        return '';

      case 'recordPage':
        return `
          border: 1px solid ${theme.border.color.medium};
          border-radius: ${theme.border.radius.md};
          padding: ${theme.spacing(2)};
        `;

      default:
        return '';
    }
  }}
`;

export const WidgetCardContent = ({
  children,
  context = 'dashboard',
  className,
}: WidgetCardContentProps) => {
  return (
    <StyledWidgetCardContent context={context} className={className}>
      {children}
    </StyledWidgetCardContent>
  );
};
