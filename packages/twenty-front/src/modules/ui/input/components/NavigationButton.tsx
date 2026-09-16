import { type ComponentType } from 'react';
import { Link, type LinkProps, useHref } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Button, type ButtonProps } from 'twenty-ui/primitives/input';

type NavigationButtonProps = Omit<ButtonProps, 'href' | 'render'> & {
  buttonComponent?: ComponentType<ButtonProps>;
  to?: LinkProps['to'];
};

const NavigationLinkButton = ({
  buttonComponent: ButtonComponent = Button,
  to,
  ...props
}: NavigationButtonProps & { to: LinkProps['to'] }) => {
  const href = useHref(to);

  return <ButtonComponent {...props} href={href} render={<Link to={to} />} />;
};

export const NavigationButton = ({
  buttonComponent: ButtonComponent = Button,
  to,
  ...props
}: NavigationButtonProps) => {
  if (isDefined(to)) {
    return (
      <NavigationLinkButton
        {...props}
        buttonComponent={ButtonComponent}
        to={to}
      />
    );
  }

  return <ButtonComponent {...props} />;
};
