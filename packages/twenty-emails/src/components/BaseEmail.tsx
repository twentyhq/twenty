import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Container, Html } from '@react-email/components';
import { PropsWithChildren } from 'react';

import { BaseHead } from 'src/components/BaseHead';
import { Logo } from 'src/components/Logo';

type BaseEmailProps = PropsWithChildren<{
  width?: number;
  locale: string;
}>;

export const BaseEmail = ({ children, width, locale }: BaseEmailProps) => {
  return (
    <I18nProvider i18n={i18n}>
      <Html lang={locale}>
        <BaseHead />
        <Container width={width || 290}>
          <Logo />
          {children}
        </Container>
      </Html>
    </I18nProvider>
  );
};
