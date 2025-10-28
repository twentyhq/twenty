import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { assertUnreachable } from 'twenty-shared/utils';

import { type WidgetCardContext } from '../types/WidgetCardContext';

export type WidgetCardContentProps = {
  children?: ReactNode;
  widgetCardContext: WidgetCardContext;
  className?: string;
};

const StyledWidgetCardContent = styled.div<WidgetCardContentProps>`
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
        return css`
          border: 1px solid ${theme.border.color.medium};
          border-radius: ${theme.border.radius.md};
        `;

      case 'dashboard':
        return '';

      default:
        return assertUnreachable(widgetCardContext);
    }
  }}
`;

export { StyledWidgetCardContent as WidgetCardContent };
