import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';
import { isWidgetCardFlushInViewMode } from '@/page-layout/widgets/utils/isWidgetCardFlushInViewMode';

type WidgetCardStyledProps = {
  variant: WidgetCardVariant;
  isEditable: boolean;
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  headerLess?: boolean;
  hasClickHandler: boolean;
};

const computeBorderColor = (
  props: Pick<
    WidgetCardStyledProps,
    'variant' | 'isEditable' | 'isEditing' | 'isDragging'
  >,
): string => {
  if (props.isEditable && (props.isEditing || props.isDragging)) {
    return themeCssVariables.color.blue;
  }
  if (props.variant === 'framed') {
    return themeCssVariables.border.color.light;
  }
  return 'transparent';
};

const shouldUseSecondaryBackground = (
  props: Pick<WidgetCardStyledProps, 'variant' | 'isEditable' | 'isDragging'>,
) => (props.isEditable && props.isDragging) || props.variant === 'framed';

// The card is the single owner of how far its header and body are inset:
// WidgetCardHeader and WidgetCardContent both read these, widget bodies never
// declare their own inline padding.
// oxlint-disable-next-line twenty/sort-css-properties-alphabetically
const StyledWidgetCard = styled.div<WidgetCardStyledProps>`
  --widget-card-padding-inline: ${({ variant, isEditable }) =>
    isWidgetCardFlushInViewMode({ variant, isEditable })
      ? themeCssVariables.spacing[4]
      : themeCssVariables.spacing[2]};
  --widget-card-title-padding-top: ${({ variant, isEditable }) =>
    isWidgetCardFlushInViewMode({ variant, isEditable })
      ? themeCssVariables.spacing[3]
      : themeCssVariables.spacing[2]};

  background: ${(props) => {
    if (props.isEditable && props.isDragging) {
      return `linear-gradient(0deg, ${themeCssVariables.background.transparent.lighter} 0%, ${themeCssVariables.background.transparent.lighter} 100%), ${themeCssVariables.background.secondary}`;
    }
    return shouldUseSecondaryBackground(props)
      ? themeCssVariables.background.secondary
      : 'transparent';
  }};

  // Declared only when the card actually paints a surface, so a transparent
  // card leaves the layout container's value in place for its content to read.
  &[data-secondary-background='true'] {
    --record-card-background-color: ${themeCssVariables.background.secondary};
  }

  border: ${(props) =>
    props.variant === 'framed' || props.isEditable
      ? `1px solid ${computeBorderColor(props)}`
      : 'none'};

  border-radius: ${({ variant, isEditable }) =>
    variant === 'framed' || isEditable
      ? themeCssVariables.border.radius.md
      : '0'};

  box-sizing: border-box;

  cursor: ${({
    isEditable,
    isDragging,
    isEditing,
    isResizing,
    hasClickHandler,
  }) =>
    isEditable && !isDragging && !isEditing && !isResizing && hasClickHandler
      ? 'pointer'
      : 'default'};

  display: flex;

  flex-direction: column;

  height: var(--widget-height, 100%);

  padding: ${({ variant, headerLess }) =>
    variant === 'framed' && headerLess !== true
      ? themeCssVariables.spacing[2]
      : '0'};

  position: relative;

  width: 100%;

  &:hover {
    border-color: ${(props) => {
      if (
        props.isEditable &&
        !props.isDragging &&
        !props.isEditing &&
        !props.isResizing
      ) {
        return themeCssVariables.border.color.strong;
      }
      return computeBorderColor(props);
    }};
  }
`;

export type WidgetCardProps = {
  variant: WidgetCardVariant;
  isEditable: boolean;
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  headerLess?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  children?: React.ReactNode;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  'data-testid'?: string;
  'data-widget-id'?: string;
};

export const WidgetCard = ({
  variant,
  isEditable,
  isEditing,
  isDragging,
  isResizing,
  headerLess,
  onClick,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  'data-testid': dataTestId,
  'data-widget-id': dataWidgetId,
}: WidgetCardProps) => {
  return (
    <StyledWidgetCard
      variant={variant}
      isEditable={isEditable}
      isEditing={isEditing}
      isDragging={isDragging}
      isResizing={isResizing}
      headerLess={headerLess}
      hasClickHandler={isDefined(onClick)}
      data-secondary-background={shouldUseSecondaryBackground({
        variant,
        isEditable,
        isDragging,
      })}
      onClick={onClick}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={dataTestId}
      data-widget-id={dataWidgetId}
    >
      {children}
    </StyledWidgetCard>
  );
};
