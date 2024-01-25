import { PropsWithChildren } from 'react';
import { Container, Html } from '@react-email/components';

import { BaseHead } from './BaseHead';
import { Logo } from './Logo';

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
