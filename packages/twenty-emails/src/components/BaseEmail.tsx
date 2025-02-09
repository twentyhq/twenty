import { i18n, Messages } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Container, Html } from '@react-email/components';
import { PropsWithChildren } from 'react';

import { BaseHead } from 'src/components/BaseHead';
import { Logo } from 'src/components/Logo';
import { APP_LOCALES } from 'twenty-shared';
import { messages as deMessages } from '../locales/generated/de-DE';
import { messages as enMessages } from '../locales/generated/en';
import { messages as esMessages } from '../locales/generated/es-ES';
import { messages as frMessages } from '../locales/generated/fr-FR';
import { messages as itMessages } from '../locales/generated/it-IT';
import { messages as jaMessages } from '../locales/generated/ja-JP';
import { messages as koMessages } from '../locales/generated/ko-KR';
import { messages as pseudoEnMessages } from '../locales/generated/pseudo-en';
import { messages as ptBRMessages } from '../locales/generated/pt-BR';
import { messages as ptPTMessages } from '../locales/generated/pt-PT';
import { messages as zhHansMessages } from '../locales/generated/zh-CN';
import { messages as zhHantMessages } from '../locales/generated/zh-TW';

type BaseEmailProps = PropsWithChildren<{
  width?: number;
  locale: keyof typeof APP_LOCALES;
}>;
const messages: Record<keyof typeof APP_LOCALES, Messages> = {
  en: enMessages,
  'pseudo-en': pseudoEnMessages,
  'fr-FR': frMessages,
  'ko-KR': koMessages,
  'de-DE': deMessages,
  'it-IT': itMessages,
  'es-ES': esMessages,
  'ja-JP': jaMessages,
  'pt-PT': ptPTMessages,
  'pt-BR': ptBRMessages,
  'zh-CN': zhHansMessages,
  'zh-TW': zhHantMessages,
};

(Object.entries(messages) as [keyof typeof APP_LOCALES, any][]).forEach(
  ([locale, message]) => {
    i18n.load(locale, message);
  },
);

i18n.activate('en');

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
