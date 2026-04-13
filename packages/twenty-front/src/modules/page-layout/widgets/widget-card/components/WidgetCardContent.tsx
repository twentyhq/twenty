import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type WidgetCardContentStyledProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
};

const getWidgetCardContentBorderStyle = ({
  variant,
  isEditable,
}: {
  variant: WidgetCardVariant;
  isEditable: boolean;
}) =>
  variant === 'record-page' || (variant === 'side-column' && isEditable)
    ? `1px solid ${themeCssVariables.border.color.medium}`
    : 'none';

const getWidgetCardContentBorderRadiusStyle = ({
  variant,
  isEditable,
}: {
  variant: WidgetCardVariant;
  isEditable: boolean;
}) =>
  variant === 'record-page' || (variant === 'side-column' && isEditable)
    ? themeCssVariables.border.radius.md
    : '0';

const getWidgetCardContentMarginTopStyle = ({
  hasHeader,
}: {
  hasHeader: boolean;
}) => (hasHeader ? themeCssVariables.spacing[2] : '0');

const getWidgetCardContentPaddingStyle = ({
  variant,
  isEditable,
}: {
  variant: WidgetCardVariant;
  isEditable: boolean;
}) => {
  if (variant === 'dashboard') return themeCssVariables.spacing[2];
  if (variant === 'record-page' || (variant === 'side-column' && isEditable)) {
    return themeCssVariables.spacing[2];
  }
  return '0';
};

const StyledWidgetCardContent = styled.div<WidgetCardContentStyledProps>`
  border: ${({ variant, isEditable }) =>
    getWidgetCardContentBorderStyle({ variant, isEditable })};
  border-radius: ${({ variant, isEditable }) =>
    getWidgetCardContentBorderRadiusStyle({ variant, isEditable })};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  height: 100%;

  margin-top: ${({ hasHeader }) =>
    getWidgetCardContentMarginTopStyle({ hasHeader })};

  overflow: hidden;

  padding: ${({ variant, isEditable }) =>
    getWidgetCardContentPaddingStyle({ variant, isEditable })};

  &:empty {
    border: ${({ variant, isEditable }) =>
      !isEditable
        ? 'none'
        : getWidgetCardContentBorderStyle({ variant, isEditable })};
    border-radius: ${({ variant, isEditable }) =>
      !isEditable
        ? '0'
        : getWidgetCardContentBorderRadiusStyle({ variant, isEditable })};
    margin-top: ${({ hasHeader, isEditable }) =>
      !isEditable ? '0' : getWidgetCardContentMarginTopStyle({ hasHeader })};
    padding: ${({ variant, isEditable }) =>
      !isEditable
        ? '0'
        : getWidgetCardContentPaddingStyle({ variant, isEditable })};
  }
`;

type WidgetCardContentProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  hasInteractiveContent?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const WidgetCardContent = ({
  variant,
  hasHeader,
  isEditable,
  hasInteractiveContent = false,
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
      className={className}
      onClick={handleContentClick}
    >
      {children}
    </StyledWidgetCardContent>
  );
};
