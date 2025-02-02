import { Injectable, OnModuleInit } from '@nestjs/common';

import { i18n } from '@lingui/core';
import { messages as emailDeMessages } from 'twenty-emails/dist/locales/generated/de';
import { messages as emailEnMessages } from 'twenty-emails/dist/locales/generated/en';
import { messages as emailEsMessages } from 'twenty-emails/dist/locales/generated/es';
import { messages as emailFrMessages } from 'twenty-emails/dist/locales/generated/fr';
import { messages as emailItMessages } from 'twenty-emails/dist/locales/generated/it';
import {
  messages as emailJaMessages,
  messages as jaMessages,
} from 'twenty-emails/dist/locales/generated/ja';
import { messages as emailKoMessages } from 'twenty-emails/dist/locales/generated/ko';
import { messages as emailPseudoEnMessages } from 'twenty-emails/dist/locales/generated/pseudo-en';
import { messages as emailPtBRMessages } from 'twenty-emails/dist/locales/generated/pt-BR';
import { messages as emailPtPTMessages } from 'twenty-emails/dist/locales/generated/pt-PT';
import { messages as emailZhHansMessages } from 'twenty-emails/dist/locales/generated/zh-Hans';
import { messages as emailZhHantMessages } from 'twenty-emails/dist/locales/generated/zh-Hant';

import { messages as deMessages } from 'src/engine/core-modules/i18n/locales/generated/de';
import { messages as enMessages } from 'src/engine/core-modules/i18n/locales/generated/en';
import { messages as esMessages } from 'src/engine/core-modules/i18n/locales/generated/es';
import { messages as frMessages } from 'src/engine/core-modules/i18n/locales/generated/fr';
import { messages as itMessages } from 'src/engine/core-modules/i18n/locales/generated/it';
import { messages as koMessages } from 'src/engine/core-modules/i18n/locales/generated/ko';
import { messages as pseudoEnMessages } from 'src/engine/core-modules/i18n/locales/generated/pseudo-en';
import { messages as ptBRMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-BR';
import { messages as ptPTMessages } from 'src/engine/core-modules/i18n/locales/generated/pt-PT';
import { messages as zhHansMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-Hans';
import { messages as zhHantMessages } from 'src/engine/core-modules/i18n/locales/generated/zh-Hant';

@Injectable()
export class I18nService implements OnModuleInit {
  async loadEmailTranslations() {
    i18n.load('en', emailEnMessages);
    i18n.load('fr', emailFrMessages);
    i18n.load('pseudo-en', emailPseudoEnMessages);
    i18n.load('ko', emailKoMessages);
    i18n.load('de', emailDeMessages);
    i18n.load('it', emailItMessages);
    i18n.load('es', emailEsMessages);
    i18n.load('ja', emailJaMessages);
    i18n.load('pt-PT', emailPtPTMessages);
    i18n.load('pt-BR', emailPtBRMessages);
    i18n.load('zh-Hans', emailZhHansMessages);
    i18n.load('zh-Hant', emailZhHantMessages);
  }

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
