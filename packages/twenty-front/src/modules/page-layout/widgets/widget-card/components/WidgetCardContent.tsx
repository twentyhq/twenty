import { styled } from '@linaria/react';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WidgetCardContentStyledProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
};

const StyledWidgetCardContent = styled.div<WidgetCardContentStyledProps>`
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

  height: 100%;

  margin-top: ${({ hasHeader }) =>
    hasHeader ? themeCssVariables.spacing[2] : '0'};

  overflow: hidden;

  padding: ${({ variant, isEditable }) => {
    if (variant === 'dashboard') return themeCssVariables.spacing[2];
    if (
      variant === 'record-page' ||
      (variant === 'side-column' && isEditable)
    ) {
      return themeCssVariables.spacing[2];
    }
    return '0';
  }};

  &:empty {
    margin-top: ${({ hasHeader, variant, isEditable }) => {
      if (hasHeader && variant === 'side-column' && !isEditable) return '0';
      return hasHeader ? themeCssVariables.spacing[2] : '0';
    }};
  }
`;

type WidgetCardContentProps = {
  variant: WidgetCardVariant;
  hasHeader: boolean;
  isEditable: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const WidgetCardContent = ({
  variant,
  hasHeader,
  isEditable,
  className,
  children,
}: WidgetCardContentProps) => {
  return (
    <StyledWidgetCardContent
      variant={variant}
      hasHeader={hasHeader}
      isEditable={isEditable}
      className={className}
    >
      {children}
    </StyledWidgetCardContent>
  );
};
