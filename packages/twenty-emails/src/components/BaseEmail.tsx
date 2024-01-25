import * as React from 'react';
import { Container, Html } from '@react-email/components';
import { BaseHead } from 'src/components/BaseHead';
import { Logo } from 'src/components/Logo';

export const BaseEmail = ({ children, width = 290 }) => {
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
