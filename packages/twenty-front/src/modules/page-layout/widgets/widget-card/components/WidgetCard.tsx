import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type WidgetCardContext } from '../types/WidgetCardContext';

export type WidgetCardProps = {
  children?: ReactNode;
  widgetCardContext?: WidgetCardContext;
  onClick?: () => void;
  isEditing?: boolean;
  isDragging?: boolean;
  className?: string;
};

const StyledWidgetCard = styled.div<{
  onClick?: () => void;
  widgetCardContext?: WidgetCardContext;
  isPageLayoutInEditMode?: boolean;
  isEditing?: boolean;
  isDragging?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;

  ${({
    theme,
    widgetCardContext,
    isPageLayoutInEditMode,
    isEditing,
    isDragging,
    onClick,
  }) => {
    switch (widgetCardContext) {
      case 'dashboard':
        return `
          background: ${theme.background.secondary};
          border: 1px solid ${theme.border.color.light};
          border-radius: ${theme.border.radius.md};
          padding: ${theme.spacing(2)};
          gap: ${theme.spacing(2)};

          ${
            isPageLayoutInEditMode && !isDragging && !isEditing
              ? `
            &:hover {
              cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
              border: 1px solid ${theme.border.color.strong};

              .widget-card-remove-button {
                display: block !important;
              }
            }
          `
              : ''
          }

          ${
            isEditing && !isDragging
              ? `
            border: 1px solid ${theme.color.blue} !important;
          `
              : ''
          }

          ${
            isDragging
              ? `
            border: 1px solid ${theme.color.blue} !important;
            background: linear-gradient(
              0deg,
              ${theme.background.transparent.lighter} 0%,
              ${theme.background.transparent.lighter} 100%
            ),
            ${theme.background.secondary};
          `
              : ''
          }
        `;

      case 'recordPage':
        return `
          padding: ${theme.spacing(2)};
          gap: ${theme.spacing(2)};
          border: 1px solid transparent;
          border-radius: ${theme.border.radius.md};
          background: ${theme.background.primary};

          ${
            isPageLayoutInEditMode && !isDragging && !isEditing
              ? `
            &:hover {
              cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
              border: 1px solid ${theme.border.color.strong};

              .widget-card-remove-button {
                display: block !important;
              }
            }
          `
              : ''
          }

          ${
            isEditing && !isDragging
              ? `
            border: 1px solid ${theme.color.blue} !important;
          `
              : ''
          }

          ${
            isDragging
              ? `
            border: 1px solid ${theme.color.blue} !important;
            background: linear-gradient(
              0deg,
              ${theme.background.transparent.lighter} 0%,
              ${theme.background.transparent.lighter} 100%
            ),
            ${theme.background.secondary};
          `
              : ''
          }
        `;

      default:
        return '';
    }
  }}
`;

export const WidgetCard = ({
  children,
  widgetCardContext = 'dashboard',
  onClick,
  isEditing = false,
  isDragging = false,
  className,
}: WidgetCardProps) => {
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  return (
    <StyledWidgetCard
      onClick={onClick}
      widgetCardContext={widgetCardContext}
      isPageLayoutInEditMode={isPageLayoutInEditMode}
      isEditing={isEditing}
      isDragging={isDragging}
      className={className}
    >
      {children}
    </StyledWidgetCard>
  );
};
