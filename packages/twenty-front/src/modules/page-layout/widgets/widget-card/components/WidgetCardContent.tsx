import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

export type WidgetCardContentProps = {
  children?: ReactNode;
  variant: WidgetCardVariant;
  className?: string;
};

const StyledWidgetCardContent = styled.div<{ variant: WidgetCardVariant }>`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;

  ${({ theme, variant }) => {
    // Canvas variant
    if (variant === 'canvas') {
      return css`
        padding: 0;
      `;
    }

    // Side column variant
    if (variant === 'side-column') {
      return css`
        border: none;
        padding: 0;
      `;
    }

    // Dashboard variant
    if (variant === 'dashboard') {
      return css`
        padding: ${theme.spacing(2)};
      `;
    }

    // Record page variant
    if (variant === 'record-page') {
      return css`
        border: 1px solid ${theme.border.color.medium};
        border-radius: ${theme.border.radius.md};
        padding: ${theme.spacing(2)};
      `;
    }
  }}
`;

export { StyledWidgetCardContent as WidgetCardContent };
