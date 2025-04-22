import { i18n, Messages } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Container, Html } from '@react-email/components';

import { BaseHead } from 'src/components/BaseHead';
import { Footer } from 'src/components/Footer';
import { Logo } from 'src/components/Logo';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages as afMessages } from '../locales/generated/af-ZA';
import { messages as arMessages } from '../locales/generated/ar-SA';
import { messages as caMessages } from '../locales/generated/ca-ES';
import { messages as csMessages } from '../locales/generated/cs-CZ';
import { messages as daMessages } from '../locales/generated/da-DK';
import { messages as deMessages } from '../locales/generated/de-DE';
import { messages as elMessages } from '../locales/generated/el-GR';
import { messages as enMessages } from '../locales/generated/en';
import { messages as esMessages } from '../locales/generated/es-ES';
import { messages as fiMessages } from '../locales/generated/fi-FI';
import { messages as frMessages } from '../locales/generated/fr-FR';
import { messages as heMessages } from '../locales/generated/he-IL';
import { messages as huMessages } from '../locales/generated/hu-HU';
import { messages as itMessages } from '../locales/generated/it-IT';
import { messages as jaMessages } from '../locales/generated/ja-JP';
import { messages as koMessages } from '../locales/generated/ko-KR';
import { messages as nlMessages } from '../locales/generated/nl-NL';
import { messages as noMessages } from '../locales/generated/no-NO';
import { messages as plMessages } from '../locales/generated/pl-PL';
import { messages as pseudoEnMessages } from '../locales/generated/pseudo-en';
import { messages as ptBRMessages } from '../locales/generated/pt-BR';
import { messages as ptPTMessages } from '../locales/generated/pt-PT';
import { messages as roMessages } from '../locales/generated/ro-RO';
import { messages as ruMessages } from '../locales/generated/ru-RU';
import { messages as srMessages } from '../locales/generated/sr-Cyrl';
import { messages as svMessages } from '../locales/generated/sv-SE';
import { messages as trMessages } from '../locales/generated/tr-TR';
import { messages as ukMessages } from '../locales/generated/uk-UA';
import { messages as viMessages } from '../locales/generated/vi-VN';
import { messages as zhHansMessages } from '../locales/generated/zh-CN';
import { messages as zhHantMessages } from '../locales/generated/zh-TW';

type BaseEmailProps = {
  children: JSX.Element | JSX.Element[] | string;
  width?: number;
  locale: keyof typeof APP_LOCALES;
};

const messages: Record<keyof typeof APP_LOCALES, Messages> = {
  en: enMessages,
  'pseudo-en': pseudoEnMessages,
  'af-ZA': afMessages,
  'ar-SA': arMessages,
  'ca-ES': caMessages,
  'cs-CZ': csMessages,
  'da-DK': daMessages,
  'de-DE': deMessages,
  'el-GR': elMessages,
  'es-ES': esMessages,
  'fi-FI': fiMessages,
  'fr-FR': frMessages,
  'he-IL': heMessages,
  'hu-HU': huMessages,
  'it-IT': itMessages,
  'ja-JP': jaMessages,
  'ko-KR': koMessages,
  'nl-NL': nlMessages,
  'no-NO': noMessages,
  'pl-PL': plMessages,
  'pt-BR': ptBRMessages,
  'pt-PT': ptPTMessages,
  'ro-RO': roMessages,
  'ru-RU': ruMessages,
  'sr-Cyrl': srMessages,
  'sv-SE': svMessages,
  'tr-TR': trMessages,
  'uk-UA': ukMessages,
  'vi-VN': viMessages,
  'zh-CN': zhHansMessages,
  'zh-TW': zhHantMessages,
};

(Object.entries(messages) as [keyof typeof APP_LOCALES, any][]).forEach(
  ([locale, message]) => {
    i18n.load(locale, message);
  },
);

i18n.activate(SOURCE_LOCALE);

export const BaseEmail = ({ children, width, locale }: BaseEmailProps) => {
  i18n.activate(locale);

  return (
    <I18nProvider i18n={i18n}>
      <Html lang={locale}>
        <BaseHead />
        <Container width={width || 290}>
          <Logo />
          {children}
          <Footer />
        </Container>
      </Html>
    </I18nProvider>
  );
};
