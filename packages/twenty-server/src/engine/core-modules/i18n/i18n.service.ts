import { Injectable, OnModuleInit } from '@nestjs/common';

import { i18n } from '@lingui/core';

import { messages as deMessages } from 'src/engine/core-modules/i18n/locales/generated/de';
import { messages as enMessages } from 'src/engine/core-modules/i18n/locales/generated/en';
import { messages as esMessages } from 'src/engine/core-modules/i18n/locales/generated/es';
import { messages as frMessages } from 'src/engine/core-modules/i18n/locales/generated/fr';
import { messages as itMessages } from 'src/engine/core-modules/i18n/locales/generated/it';
import { messages as jaMessages } from 'src/engine/core-modules/i18n/locales/generated/ja';
import { messages as koMessages } from 'src/engine/core-modules/i18n/locales/generated/ko';
import { messages as pseudoEnMessages } from 'src/engine/core-modules/i18n/locales/generated/pseudo-en';
import { messages as ptBRMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-BR';
import { messages as ptPTMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-PT';
import { messages as zhHansMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-Hans';
import { messages as zhHantMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-Hant';

@Injectable()
export class I18nService implements OnModuleInit {
  async loadTranslations() {
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
  }

  async onModuleInit() {
    this.loadTranslations();
  }
}
