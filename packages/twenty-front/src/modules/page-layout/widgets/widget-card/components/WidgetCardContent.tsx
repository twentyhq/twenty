import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { STACKED_WIDGET_MAX_HEIGHT } from '~/modules/page-layout/widgets/constants/StackedWidgetMaxHeight';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type WidgetCardContentStyledProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  isInVerticalListTab: boolean;
  isMobile: boolean;
  hasBoundedHeight: boolean;
};

const StyledWidgetCardContent = styled.div<WidgetCardContentStyledProps>`
  background-color: ${({ variant, isInVerticalListTab, isMobile }) =>
    variant === 'record-page' && isInVerticalListTab && !isMobile
      ? themeCssVariables.background.secondary
      : 'transparent'};
  border: ${({ variant, isEditable }) =>
    variant === 'record-page' || (variant === 'side-column' && isEditable)
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${({ variant, isEditable }) =>
    variant === 'record-page' || (variant === 'side-column' && isEditable)
      ? themeCssVariables.border.radius.md
      : '0'};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  height: ${({ hasBoundedHeight }) => (hasBoundedHeight ? 'auto' : '100%')};

  margin-top: ${({ hasHeader }) =>
    hasHeader ? themeCssVariables.spacing[2] : '0'};

  max-height: ${({ hasBoundedHeight }) =>
    hasBoundedHeight ? `${STACKED_WIDGET_MAX_HEIGHT}px` : 'none'};

  overflow: ${({ hasBoundedHeight }) => (hasBoundedHeight ? 'auto' : 'hidden')};

  padding: ${({ variant, isEditable }) => {
    if (variant === 'dashboard' || variant === 'standalone')
      return themeCssVariables.spacing[2];
    if (
      variant === 'record-page' ||
      (variant === 'side-column' && isEditable)
    ) {
      return themeCssVariables.spacing[2];
    }
    return '0';
  }};

  &:empty {
    border: none;
    border-radius: 0;
    margin-top: 0;
    padding: 0;
  }
`;

type WidgetCardContentProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  isInVerticalListTab: boolean;
  isMobile: boolean;
  hasInteractiveContent?: boolean;
  hasBoundedHeight?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const WidgetCardContent = ({
  variant,
  hasHeader,
  isEditable,
  isInVerticalListTab,
  isMobile,
  hasInteractiveContent = false,
  hasBoundedHeight = false,
  className,
  children,
}: WidgetCardContentProps) => {
  const handleContentClick = (event: React.MouseEvent) => {
    if (!isEditable || !hasInteractiveContent) {
      return;
    }

    event.stopPropagation();
  };

  return (
    <StyledWidgetCardContent
      variant={variant}
      hasHeader={hasHeader}
      isEditable={isEditable}
      isInVerticalListTab={isInVerticalListTab}
      isMobile={isMobile}
      hasBoundedHeight={hasBoundedHeight}
      className={className}
      onClick={handleContentClick}
    >
      {children}
    </StyledWidgetCardContent>
  );
};
