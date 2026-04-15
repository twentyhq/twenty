import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type WidgetCardStyledProps = {
  variant: WidgetCardVariant;
  isEditable: boolean;
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  headerLess?: boolean;
  isLastWidget?: boolean;
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
  if (props.variant === 'dashboard' || props.variant === 'standalone') {
    return themeCssVariables.border.color.light;
  }
  return 'transparent';
};

// oxlint-disable-next-line twenty/sort-css-properties-alphabetically
const StyledWidgetCard = styled.div<WidgetCardStyledProps>`
  background: ${(props) => {
    if (props.isEditable && props.isDragging) {
      return `linear-gradient(0deg, ${themeCssVariables.background.transparent.lighter} 0%, ${themeCssVariables.background.transparent.lighter} 100%), ${themeCssVariables.background.secondary}`;
    }
    if (
      props.variant === 'dashboard' ||
      props.variant === 'standalone' ||
      (props.variant === 'side-column' && props.isEditable)
    ) {
      return themeCssVariables.background.secondary;
    }
    if (props.variant === 'record-page') {
      return themeCssVariables.background.primary;
    }
    return 'none';
  }};

  border: ${(props) =>
    props.variant === 'dashboard' ||
    props.variant === 'standalone' ||
    props.variant === 'record-page' ||
    props.isEditable
      ? `1px solid ${computeBorderColor(props)}`
      : 'none'};

  border-bottom: ${(props) => {
    const { variant, isEditable, isLastWidget } = props;

    if (variant === 'side-column' && !isEditable) {
      return isLastWidget !== true
        ? `1px solid ${themeCssVariables.border.color.light}`
        : 'none';
    }

    return `1px solid ${computeBorderColor(props)}`;
  }};
  border-radius: ${({ variant, isEditable }) =>
    variant === 'dashboard' ||
    variant === 'standalone' ||
    variant === 'record-page' ||
    isEditable
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

  height: 100%;

  padding: ${({ variant, isEditable, headerLess }) => {
    if (
      (variant === 'dashboard' || variant === 'standalone') &&
      headerLess === true
    )
      return '0';
    if (variant === 'dashboard' || variant === 'standalone')
      return themeCssVariables.spacing[2];
    if (variant === 'side-column' && !isEditable)
      return themeCssVariables.spacing[3];
    if (variant === 'record-page' || isEditable)
      return themeCssVariables.spacing[2];
    return '0';
  }};

  position: relative;

  width: 100%;

  &:hover {
    // border-color shorthand must precede border-bottom-color longhand for correct CSS cascade
    border-color: ${(props) => {
      if (props.variant === 'canvas') {
        return computeBorderColor(props);
      }
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

    border-bottom-color: ${(props) => {
      if (props.variant === 'canvas') {
        return computeBorderColor(props);
      }

      const { variant, isEditable } = props;

      if (variant === 'side-column' && !isEditable) {
        return themeCssVariables.border.color.light;
      }

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
  isLastWidget?: boolean;
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
  isLastWidget,
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
      isLastWidget={isLastWidget}
      hasClickHandler={isDefined(onClick)}
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
