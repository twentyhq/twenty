import { styled } from '@linaria/react';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { css } from '@linaria/core';

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

  ${({ variant, isEditable, hasHeader }) => {
    if (!hasHeader) {
      return '';
    }

    if (variant === 'side-column' && !isEditable) {
      return css`
        margin-top: ${themeCssVariables.spacing[2]};

        :empty {
          margin-top: 0;
        }
      `;
    }

    return css`
      margin-top: ${themeCssVariables.spacing[2]};
    `;
  }}

  ${({ variant, isEditable }) => {
    if (variant === 'dashboard') {
      return css`
        padding: ${themeCssVariables.spacing[2]};
      `;
    }

    if (
      variant === 'record-page' ||
      (variant === 'side-column' && isEditable)
    ) {
      return css`
        border: 1px solid ${themeCssVariables.border.color.medium};
        border-radius: ${themeCssVariables.border.radius.md};
        padding: ${themeCssVariables.spacing[2]};
      `;
    }
    return '';
  }}
`;

export { StyledWidgetCardContent as WidgetCardContent };
