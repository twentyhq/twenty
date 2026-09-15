import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { styled } from '@linaria/react';
import { type ComponentProps } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type MainButtonProps = ComponentProps<typeof NavigationButton>;

const StyledButton = styled(NavigationButton)`
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-inline: ${themeCssVariables.spacing[3]};
`;

export const MainButton = ({
  'aria-label': ariaLabel,
  children,
  className,
  color,
  disabled,
  elevated = true,
  fullWidth,
  onClick,
  size,
  startIcon,
  to,
  type,
  variant = 'solid',
}: MainButtonProps) => (
  <StyledButton
    aria-label={ariaLabel}
    className={className}
    color={color}
    disabled={disabled}
    elevated={elevated}
    fullWidth={fullWidth}
    onClick={onClick}
    size={size}
    startIcon={startIcon}
    to={to}
    type={type}
    variant={variant}
  >
    {children}
  </StyledButton>
);
