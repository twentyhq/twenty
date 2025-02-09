import { Injectable, OnModuleInit } from '@nestjs/common';

import { i18n } from '@lingui/core';
import { APP_LOCALES } from 'twenty-shared';

import { messages as deMessages } from 'src/engine/core-modules/i18n/locales/generated/de-DE';
import { messages as enMessages } from 'src/engine/core-modules/i18n/locales/generated/en';
import { messages as esMessages } from 'src/engine/core-modules/i18n/locales/generated/es-ES';
import { messages as frMessages } from 'src/engine/core-modules/i18n/locales/generated/fr-FR';
import { messages as itMessages } from 'src/engine/core-modules/i18n/locales/generated/it-IT';
import { messages as jaMessages } from 'src/engine/core-modules/i18n/locales/generated/ja-JP';
import { messages as koMessages } from 'src/engine/core-modules/i18n/locales/generated/ko-KR';
import { messages as pseudoEnMessages } from 'src/engine/core-modules/i18n/locales/generated/pseudo-en';
import { messages as ptBRMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-BR';
import { messages as ptPTMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-PT';
import { messages as zhHansMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-CN';
import { messages as zhHantMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-TW';

@Injectable()
export class I18nService implements OnModuleInit {
  async loadTranslations() {
    const messages: Record<keyof typeof APP_LOCALES, any> = {
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
  }

  async onModuleInit() {
    this.loadTranslations();
  }
}
