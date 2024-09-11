import { PropsWithChildren } from 'react';
import { Container, Html } from '@react-email/components';

import { BaseHead } from 'src/components/BaseHead';
import { Logo } from 'src/components/Logo';

type BaseEmailProps = PropsWithChildren<{
  width?: number;
}>;

export const BaseEmail = ({ children, width }: BaseEmailProps) => {
  return (
    <Html lang="en">
      <BaseHead />
      <Container width={width || 290}>
        <Logo />
        {children}
      </Container>
    </Html>
  );
};
