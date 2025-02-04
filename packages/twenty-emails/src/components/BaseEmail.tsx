import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Container, Html } from '@react-email/components';
import { PropsWithChildren } from 'react';

import { BaseHead } from 'src/components/BaseHead';
import { Logo } from 'src/components/Logo';
import { APP_LOCALES } from 'twenty-shared';
import { messages as deMessages } from '../locales/generated/de';
import { messages as enMessages } from '../locales/generated/en';
import { messages as esMessages } from '../locales/generated/es';
import { messages as frMessages } from '../locales/generated/fr';
import { messages as itMessages } from '../locales/generated/it';
import { messages as jaMessages } from '../locales/generated/ja';
import { messages as koMessages } from '../locales/generated/ko';
import { messages as pseudoEnMessages } from '../locales/generated/pseudo-en';
import { messages as ptBRMessages } from '../locales/generated/pt-BR';
import { messages as ptPTMessages } from '../locales/generated/pt-PT';
import { messages as zhHansMessages } from '../locales/generated/zh-Hans';
import { messages as zhHantMessages } from '../locales/generated/zh-Hant';

type BaseEmailProps = PropsWithChildren<{
  width?: number;
  locale: keyof typeof APP_LOCALES;
}>;

i18n.load('en', enMessages);
i18n.load('fr', frMessages);
i18n.load('pseudo-en', pseudoEnMessages);
i18n.load('ko', koMessages);
i18n.load('de', deMessages);
i18n.load('it', itMessages);
i18n.load('es', esMessages);
i18n.load('ja', jaMessages);
i18n.load('pt-PT', ptPTMessages);
i18n.load('pt-BR', ptBRMessages);
i18n.load('zh-Hans', zhHansMessages);
i18n.load('zh-Hant', zhHantMessages);

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
