import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

export type WidgetCardProps = {
  children?: ReactNode;
  variant: WidgetCardVariant;
  isEditable: boolean;
  onClick?: () => void;
  isEditing?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const StyledWidgetCard = styled.div<{
  variant: WidgetCardVariant;
  isEditable: boolean;
  onClick?: () => void;
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
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
  }) => {
    // Canvas variant
    if (variant === 'canvas') {
      return css`
        height: 100%;
      `;
    }

    // Side column variant - read-only
    if (variant === 'side-column' && !isEditable) {
      return css`
        border: none;
        padding: 0;
        border-radius: 0;
        background: ${theme.background.secondary};
      `;
    }

    // Side column variant - editable
    if (variant === 'side-column' && isEditable) {
      return css`
        border: none;
        padding: 0;
        border-radius: 0;
        background: ${theme.background.secondary};

        ${!isDragging &&
        !isEditing &&
        !isResizing &&
        css`
          &:hover {
            cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
          }
        `}
      `;
    }

    // Dashboard variant - read-only
    if (variant === 'dashboard' && !isEditable) {
      return css`
        background: ${theme.background.secondary};
        border: 1px solid ${theme.border.color.light};
        border-radius: ${theme.border.radius.md};
        padding: ${theme.spacing(2)};
        gap: ${theme.spacing(2)};
      `;
    }

    // Dashboard variant - editable
    if (variant === 'dashboard' && isEditable) {
      return css`
        background: ${theme.background.secondary};
        border: 1px solid ${theme.border.color.light};
        border-radius: ${theme.border.radius.md};
        padding: ${theme.spacing(2)};
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

    // Record page variant - read-only
    if (variant === 'record-page' && !isEditable) {
      return css`
        background: ${theme.background.primary};
        border: 1px solid transparent;
        border-radius: ${theme.border.radius.md};
        gap: ${theme.spacing(2)};
        padding: ${theme.spacing(2)};
      `;
    }

    // Record page variant - editable
    if (variant === 'record-page' && isEditable) {
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
  }}
`;

export const WidgetCard = ({
  children,
  variant,
  isEditable,
  onClick,
  isEditing = false,
  isDragging = false,
  isResizing = false,
  className,
  onMouseEnter,
  onMouseLeave,
}: WidgetCardProps) => {
  return (
    <StyledWidgetCard
      variant={variant}
      isEditable={isEditable}
      onClick={onClick}
      isEditing={isEditing}
      isDragging={isDragging}
      isResizing={isResizing}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </StyledWidgetCard>
  );
};
