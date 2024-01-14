import * as React from 'react';
import { Container, Html } from '@react-email/components';

import { BaseHead } from 'src/emails/components/BaseHead';
import { Logo } from 'src/emails/components/Logo';

export const BaseEmail = ({ children }) => {
  return (
    <Html lang="en">
      <BaseHead />
      <Container width={290}>
        <Logo />
        {children}
      </Container>
    </Html>
  );
};
