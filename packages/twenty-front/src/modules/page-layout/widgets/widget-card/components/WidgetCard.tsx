import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type WidgetCardContext } from '../types/WidgetCardContext';

export type WidgetCardProps = {
  children?: ReactNode;
  context?: WidgetCardContext;
  onClick?: () => void;
  isEditing?: boolean;
  isDragging?: boolean;
  className?: string;
};

const StyledWidgetCard = styled.div<{
  onClick?: () => void;
  context?: WidgetCardContext;
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
    context,
    isPageLayoutInEditMode,
    isEditing,
    isDragging,
    onClick,
  }) => {
    switch (context) {
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
            border: 1px solid ${theme.color.blue};
          `
              : ''
          }

          ${
            isDragging
              ? `
            border: 1px solid ${theme.color.blue};
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
            border: 1px solid ${theme.color.blue};
          `
              : ''
          }

          ${
            isDragging
              ? `
            border: 1px solid ${theme.color.blue};
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
  context = 'dashboard',
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
      context={context}
      isPageLayoutInEditMode={isPageLayoutInEditMode}
      isEditing={isEditing}
      isDragging={isDragging}
      className={className}
    >
      {children}
    </StyledWidgetCard>
  );
};
