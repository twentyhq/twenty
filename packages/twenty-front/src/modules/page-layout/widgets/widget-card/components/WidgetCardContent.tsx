import { type WidgetContentPadding } from '@/page-layout/widgets/utils/getWidgetContentPadding';
import { isWidgetCardFlushInViewMode } from '@/page-layout/widgets/utils/isWidgetCardFlushInViewMode';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

const VERTICAL_LIST_IFRAME_HEIGHT = '40rem';

type WidgetCardContentStyledProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  isFixedHeight: boolean;
  contentPadding: WidgetContentPadding;
};

const StyledWidgetCardContent = styled.div<WidgetCardContentStyledProps>`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  height: ${({ isFixedHeight }) =>
    isFixedHeight ? VERTICAL_LIST_IFRAME_HEIGHT : 'var(--widget-height, 100%)'};

  margin-top: ${({ hasHeader, variant }) =>
    hasHeader && variant === 'framed' ? themeCssVariables.spacing[2] : '0'};

  min-height: ${({ isFixedHeight }) =>
    isFixedHeight ? VERTICAL_LIST_IFRAME_HEIGHT : '0'};

  overflow: ${({ isFixedHeight }) =>
    isFixedHeight ? 'clip' : 'var(--widget-card-content-overflow, hidden)'};

  padding-block: ${({ contentPadding, hasHeader, isEditable, variant }) =>
    contentPadding === 'none'
      ? '0'
      : hasHeader && isWidgetCardFlushInViewMode({ isEditable, variant })
        ? `${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]}`
        : themeCssVariables.spacing[2]};
  padding-inline: ${({ contentPadding }) =>
    contentPadding === 'none' ? '0' : 'var(--widget-card-padding-inline)'};

  &:empty {
    margin-top: 0;
    padding: 0;
  }
`;

type WidgetCardContentProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  hasInteractiveContent?: boolean;
  isFixedHeight?: boolean;
  contentPadding?: WidgetContentPadding;
  children?: React.ReactNode;
};

export const WidgetCardContent = ({
  variant,
  hasHeader,
  isEditable,
  hasInteractiveContent = false,
  isFixedHeight = false,
  contentPadding = 'default',
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
      isFixedHeight={isFixedHeight}
      contentPadding={contentPadding}
      onClick={handleContentClick}
    >
      {children}
    </StyledWidgetCardContent>
  );
};
