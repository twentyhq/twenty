import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

const StyledWidgetCardContent = styled.div<{
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
}>`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  overflow: hidden;

  ${({ theme, variant, isEditable, hasHeader }) => {
    if (!hasHeader) {
      return;
    }

    if (variant === 'side-column' && !isEditable) {
      return css`
        margin-top: ${theme.spacing(2)};

        :empty {
          margin-top: 0;
        }
      `;
    }

    return css`
      margin-top: ${theme.spacing(2)};
    `;
  }}

  ${({ theme, variant, isEditable }) => {
    if (variant === 'dashboard') {
      return css`
        padding: ${theme.spacing(2)};
      `;
    }

    if (
      variant === 'record-page' ||
      (variant === 'side-column' && isEditable)
    ) {
      return css`
        border: 1px solid ${theme.border.color.medium};
        border-radius: ${theme.border.radius.md};
        padding: ${theme.spacing(2)};
      `;
    }
  }}
`;

export { StyledWidgetCardContent as WidgetCardContent };
