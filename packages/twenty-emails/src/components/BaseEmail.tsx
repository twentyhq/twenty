import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Container, Html } from '@react-email/components';
import { PropsWithChildren } from 'react';

import { BaseHead } from 'src/components/BaseHead';
import { Logo } from 'src/components/Logo';
import { APP_LOCALES } from 'twenty-shared';

type BaseEmailProps = PropsWithChildren<{
  width?: number;
  locale: keyof typeof APP_LOCALES;
}>;

export const BaseEmail = ({ children, width, locale }: BaseEmailProps) => {
  i18n.activate(locale);

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
