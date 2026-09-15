import { Link, type LinkProps } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Button, type ButtonProps } from 'twenty-ui/input';

type NavigationButtonProps = Pick<
  ButtonProps,
  | 'aria-label'
  | 'children'
  | 'className'
  | 'color'
  | 'disabled'
  | 'elevated'
  | 'fullWidth'
  | 'onClick'
  | 'size'
  | 'startIcon'
  | 'type'
  | 'variant'
> & {
  to?: LinkProps['to'];
};

export const NavigationButton = ({
  'aria-label': ariaLabel,
  children,
  className,
  color,
  disabled,
  elevated,
  fullWidth,
  onClick,
  size,
  startIcon,
  to,
  type,
  variant,
}: NavigationButtonProps) => {
  const isLink = isDefined(to);

  return (
    <Button
      aria-label={ariaLabel}
      className={className}
      color={color}
      disabled={disabled}
      elevated={elevated}
      fullWidth={fullWidth}
      onClick={onClick}
      size={size}
      startIcon={startIcon}
      type={isLink ? undefined : (type ?? 'button')}
      variant={variant}
      render={isLink ? <Link to={to} /> : undefined}
      role={isLink ? 'link' : undefined}
      nativeButton={!isLink}
    >
      {children}
    </Button>
  );
};
