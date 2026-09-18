import { type ComponentType } from 'react';
import { type LinkProps } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Button, type ButtonProps } from 'twenty-ui/primitives/input';

import { NavigationLink } from '@/ui/input/components/NavigationLink';

type NavigationButtonProps = Omit<ButtonProps, 'href' | 'render'> & {
  buttonComponent?: ComponentType<ButtonProps>;
  to?: LinkProps['to'];
};

export const NavigationButton = ({
  buttonComponent: ButtonComponent = Button,
  to,
  ...props
}: NavigationButtonProps) => {
  if (isDefined(to)) {
    return (
      <NavigationLink to={to}>
        {({ href, render }) => (
          <ButtonComponent {...props} href={href} render={render} />
        )}
      </NavigationLink>
    );
  }

  return <ButtonComponent {...props} />;
};
