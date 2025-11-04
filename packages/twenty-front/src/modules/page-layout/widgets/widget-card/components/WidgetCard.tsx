import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated/graphql';

export type WidgetCardProps = {
  children?: ReactNode;
  pageLayoutType: PageLayoutType;
  layoutMode: PageLayoutTabLayoutMode;
  onClick?: () => void;
  isEditing: boolean;
  isDragging: boolean;
  className?: string;
};

const StyledWidgetCard = styled.div<{
  onClick?: () => void;
  pageLayoutType: PageLayoutType;
  layoutMode: PageLayoutTabLayoutMode;
  isPageLayoutInEditMode: boolean;
  isEditing: boolean;
  isDragging: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;

  ${({
    theme,
    pageLayoutType,
    layoutMode,
    isPageLayoutInEditMode,
    isEditing,
    isDragging,
    onClick,
  }) => {
    if (layoutMode === 'canvas') {
      return css`
        height: 100%;
      `;
    }

    switch (pageLayoutType) {
      case PageLayoutType.DASHBOARD:
        return css`
          background: ${theme.background.secondary};
          border: 1px solid ${theme.border.color.light};
          border-radius: ${theme.border.radius.md};
          padding: ${theme.spacing(2)};
          gap: ${theme.spacing(2)};

          ${isPageLayoutInEditMode &&
          !isDragging &&
          !isEditing &&
          css`
            &:hover {
              cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
              border: 1px solid ${theme.border.color.strong};

              .widget-card-remove-button {
                display: flex !important;
              }
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

      case PageLayoutType.RECORD_PAGE:
        return css`
          background: ${theme.background.primary};
          border: 1px solid transparent;
          border-radius: ${theme.border.radius.md};
          gap: ${theme.spacing(2)};
          padding: ${theme.spacing(2)};

          ${isPageLayoutInEditMode &&
          !isDragging &&
          !isEditing &&
          css`
            &:hover {
              cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
              border: 1px solid ${theme.border.color.strong};

              .widget-card-remove-button {
                display: flex !important;
              }
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

      default:
        return '';
    }
  }}
`;

export const WidgetCard = ({
  children,
  pageLayoutType,
  layoutMode,
  onClick,
  isEditing,
  isDragging,
  className,
}: WidgetCardProps) => {
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  return (
    <StyledWidgetCard
      onClick={onClick}
      pageLayoutType={pageLayoutType}
      layoutMode={layoutMode}
      isPageLayoutInEditMode={isPageLayoutInEditMode}
      isEditing={isEditing}
      isDragging={isDragging}
      className={className}
    >
      {children}
    </StyledWidgetCard>
  );
};
