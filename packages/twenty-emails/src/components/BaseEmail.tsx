import { PropsWithChildren } from 'react';
import { Container, Html } from '@react-email/components';

import { BaseHead } from './BaseHead';
import { Logo } from './Logo';

type BaseEmailProps = PropsWithChildren<{
  width?: number;
}>;

export const BaseEmail = ({ children, width = 290 }: BaseEmailProps) => {
  return (
    <Html lang="en">
      <BaseHead />
      <Container width={width}>
        <Logo />
        {children}
      </Container>
    </Html>
  );
};
