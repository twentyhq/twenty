import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

const StyledWidgetCardContent = styled.div<{
  variant: WidgetCardVariant;
  hasHeader?: boolean;
}>`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  overflow: hidden;

  ${({ theme, variant, hasHeader }) => {
    const headerPadding = hasHeader
      ? css`
          padding-top: ${theme.spacing(2)};
        `
      : '';

    if (variant === 'dashboard') {
      return css`
        padding: ${theme.spacing(2)};
        ${headerPadding}
      `;
    }

    if (variant === 'record-page') {
      return css`
        border: 1px solid ${theme.border.color.medium};
        border-radius: ${theme.border.radius.md};
        padding: ${theme.spacing(2)};
        ${headerPadding}
      `;
    }

    if (variant === 'side-column') {
      // Side-column variant has no base padding, only header spacing when needed
      return css`
        ${headerPadding}
      `;
    }
  }}
`;

export { StyledWidgetCardContent as WidgetCardContent };
