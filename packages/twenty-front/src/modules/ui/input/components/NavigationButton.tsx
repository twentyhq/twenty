import { type ComponentType } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Button, type ButtonProps } from 'twenty-ui/primitives/input';

type NavigationButtonProps = Omit<
  ButtonProps,
  'href' | 'render' | 'nativeButton'
> & {
  buttonComponent?: ComponentType<ButtonProps>;
  to?: LinkProps['to'];
};

export const NavigationButton = ({
  buttonComponent: ButtonComponent = Button,
  role,
  to,
  type,
  ...props
}: NavigationButtonProps) => {
  const isLink = isDefined(to);

  return (
    <ButtonComponent
      {...props}
      type={isLink ? undefined : (type ?? 'button')}
      render={isLink ? <Link to={to} /> : undefined}
      role={isLink ? 'link' : role}
      nativeButton={!isLink}
    />
  );
};
