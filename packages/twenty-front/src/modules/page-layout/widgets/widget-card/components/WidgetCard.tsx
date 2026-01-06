import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

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
    theme,
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
        background: ${theme.background.secondary};
        border: 1px solid ${theme.border.color.light};
        border-radius: ${theme.border.radius.md};
        padding: ${headerLess ? 0 : theme.spacing(2)};
        gap: ${theme.spacing(2)};
      `;
    }

    if (variant === 'dashboard' && isEditable) {
      return css`
        background: ${theme.background.secondary};
        border: 1px solid ${theme.border.color.light};
        border-radius: ${theme.border.radius.md};
        padding: ${headerLess ? 0 : theme.spacing(2)};
        gap: ${theme.spacing(2)};

        ${!isDragging &&
        !isEditing &&
        !isResizing &&
        css`
          &:hover {
            border: 1px solid ${theme.border.color.strong};
            cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
          }
        `}

        ${isEditing &&
        !isDragging &&
        css`
          border: 1px solid ${theme.color.blue} !important;
        `}

        ${isDragging &&
        css`
          background: linear-gradient(
              0deg,
              ${theme.background.transparent.lighter} 0%,
              ${theme.background.transparent.lighter} 100%
            ),
            ${theme.background.secondary};
          border: 1px solid ${theme.color.blue} !important;
        `}
      `;
    }

    if (variant === 'side-column' && !isEditable) {
      return css`
        padding: ${theme.spacing(2)};
        ${isLastWidget !== true &&
        css`
          border-bottom: 1px solid ${theme.border.color.light};
        `}
      `;
    }

    if (
      (variant === 'side-column' && isEditable) ||
      (variant === 'record-page' && isEditable)
    ) {
      return css`
        background: ${theme.background.primary};
        border: 1px solid transparent;
        border-radius: ${theme.border.radius.md};
        gap: ${theme.spacing(2)};
        padding: ${theme.spacing(2)};

        ${!isDragging &&
        !isEditing &&
        !isResizing &&
        css`
          &:hover {
            border: 1px solid ${theme.border.color.strong};
            cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
          }
        `}

        ${isEditing &&
        !isDragging &&
        css`
          border: 1px solid ${theme.color.blue} !important;
        `}

        ${isDragging &&
        css`
          background: linear-gradient(
              0deg,
              ${theme.background.transparent.lighter} 0%,
              ${theme.background.transparent.lighter} 100%
            ),
            ${theme.background.secondary};
          border: 1px solid ${theme.color.blue} !important;
        `}
      `;
    }

    if (variant === 'record-page' && !isEditable) {
      return css`
        background: ${theme.background.primary};
        border: 1px solid transparent;
        border-radius: ${theme.border.radius.md};
        gap: ${theme.spacing(2)};
        padding: ${theme.spacing(2)};
      `;
    }
  }}
`;

export { StyledWidgetCard as WidgetCard };
