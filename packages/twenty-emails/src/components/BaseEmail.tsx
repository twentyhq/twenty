import { PropsWithChildren } from 'react';
import { Container, Html } from '@react-email/components';

import { BaseHead } from 'src/components/BaseHead';
import { Logo } from 'src/components/Logo';

type BaseEmailProps = PropsWithChildren<{
  width?: number;
  withLogo?: boolean;
}>;

export const BaseEmail = ({
  children,
  width,
  withLogo = true,
}: BaseEmailProps) => {
  return (
    <Html lang="en">
      <BaseHead />
      <Container width={width || 290}>
        {withLogo && <Logo />}
        {children}
      </Container>
    </Html>
  );
};
