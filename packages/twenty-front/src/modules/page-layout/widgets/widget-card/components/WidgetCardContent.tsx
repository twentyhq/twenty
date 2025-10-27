import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { type WidgetCardContext } from '../types/WidgetCardContext';

export type WidgetCardContentProps = {
  children?: ReactNode;
  widgetCardContext?: WidgetCardContext;
  className?: string;
};

const StyledWidgetCardContent = styled.div<{
  widgetCardContext?: WidgetCardContext;
}>`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ theme, widgetCardContext }) => {
    switch (widgetCardContext) {
      case 'recordPage':
        return `
          border: 1px solid ${theme.border.color.medium};
          border-radius: ${theme.border.radius.md};
        `;

      default:
        return '';
    }
  }}
`;

export const WidgetCardContent = ({
  children,
  widgetCardContext = 'dashboard',
  className,
}: WidgetCardContentProps) => {
  return (
    <StyledWidgetCardContent
      widgetCardContext={widgetCardContext}
      className={className}
    >
      {children}
    </StyledWidgetCardContent>
  );
};
