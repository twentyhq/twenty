import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { css } from '@linaria/core';

const StyledWidgetCard = styled.div<{
  variant: WidgetCardVariant;
  isEditable: boolean;
  onClick?: () => void;
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  headerLess?: boolean;
  isLastWidget?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  width: 100%;

  ${({
    variant,
    isEditable,
    isEditing,
    isDragging,
    isResizing,
    onClick,
    headerLess,
    isLastWidget,
  }) => {
    if (variant === 'dashboard' && !isEditable) {
      return css`
        background: ${themeCssVariables.background.secondary};
        border: 1px solid ${themeCssVariables.border.color.light};
        border-radius: ${themeCssVariables.border.radius.md};
        padding: ${headerLess ? 0 : themeCssVariables.spacing[2]};
      `;
    }

    if (variant === 'dashboard' && isEditable) {
      return css`
        background: ${themeCssVariables.background.secondary};
        border: 1px solid ${themeCssVariables.border.color.light};
        border-radius: ${themeCssVariables.border.radius.md};
        padding: ${headerLess ? 0 : themeCssVariables.spacing[2]};

        ${!isDragging && !isEditing && !isResizing
          ? css`
              &:hover {
                border: 1px solid ${themeCssVariables.border.color.strong};
                cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
              }
            `
          : ''}

        ${isEditing && !isDragging
          ? css`
              border: 1px solid ${themeCssVariables.color.blue} !important;
            `
          : ''}

        ${isDragging
          ? css`
              background: linear-gradient(
                  0deg,
                  ${themeCssVariables.background.transparent.lighter} 0%,
                  ${themeCssVariables.background.transparent.lighter} 100%
                ),
                ${themeCssVariables.background.secondary};
              border: 1px solid ${themeCssVariables.color.blue} !important;
            `
          : ''}
      `;
    }

    if (variant === 'side-column' && !isEditable) {
      return css`
        padding: ${themeCssVariables.spacing[3]};

        ${isLastWidget !== true
          ? css`
              border-bottom: 1px solid ${themeCssVariables.border.color.light};
            `
          : ''}
      `;
    }

    if (variant === 'record-page' && !isEditable) {
      return css`
        background: ${themeCssVariables.background.primary};
        border: 1px solid transparent;
        border-radius: ${themeCssVariables.border.radius.md};
        padding: ${themeCssVariables.spacing[2]};
      `;
    }

    if (
      (variant === 'side-column' && isEditable) ||
      (variant === 'record-page' && isEditable)
    ) {
      return css`
        background: ${variant === 'side-column'
          ? themeCssVariables.background.secondary
          : themeCssVariables.background.primary};
        border: 1px solid transparent;
        border-radius: ${themeCssVariables.border.radius.md};
        padding: ${themeCssVariables.spacing[2]};

        ${!isDragging && !isEditing && !isResizing
          ? css`
              &:hover {
                border: 1px solid ${themeCssVariables.border.color.strong};
                cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
              }
            `
          : ''}

        ${isEditing && !isDragging
          ? css`
              border: 1px solid ${themeCssVariables.color.blue} !important;
            `
          : ''}

        ${isDragging
          ? css`
              background: linear-gradient(
                  0deg,
                  ${themeCssVariables.background.transparent.lighter} 0%,
                  ${themeCssVariables.background.transparent.lighter} 100%
                ),
                ${themeCssVariables.background.secondary};
              border: 1px solid ${themeCssVariables.color.blue} !important;
            `
          : ''}
      `;
    }

    return '';
  }}
`;

export { StyledWidgetCard as WidgetCard };
