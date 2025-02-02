import { Injectable, OnModuleInit } from '@nestjs/common';

import { i18n, Messages } from '@lingui/core';
import { messages as emailDeMessages } from 'twenty-emails/dist/locales/generated/de';
import { messages as emailEnMessages } from 'twenty-emails/dist/locales/generated/en';
import { messages as emailEsMessages } from 'twenty-emails/dist/locales/generated/es';
import { messages as emailFrMessages } from 'twenty-emails/dist/locales/generated/fr';
import { messages as emailItMessages } from 'twenty-emails/dist/locales/generated/it';
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
  private mergeMessages(
    serverMessages: Messages,
    emailMessages: Messages,
  ): Messages {
    return {
      ...serverMessages,
      ...emailMessages,
    };
  }

  async onModuleInit() {
    i18n.load('en', this.mergeMessages(enMessages, emailEnMessages));
    i18n.load('fr', this.mergeMessages(frMessages, emailFrMessages));
    i18n.load(
      'pseudo-en',
      this.mergeMessages(pseudoEnMessages, emailPseudoEnMessages),
    );
    i18n.load('ko', this.mergeMessages(koMessages, emailKoMessages));
    i18n.load('de', this.mergeMessages(deMessages, emailDeMessages));
    i18n.load('it', this.mergeMessages(itMessages, emailItMessages));
    i18n.load('es', this.mergeMessages(esMessages, emailEsMessages));
    i18n.load('pt-PT', this.mergeMessages(ptPTMessages, emailPtPTMessages));
    i18n.load('pt-BR', this.mergeMessages(ptBRMessages, emailPtBRMessages));
    i18n.load(
      'zh-Hans',
      this.mergeMessages(zhHansMessages, emailZhHansMessages),
    );
    i18n.load(
      'zh-Hant',
      this.mergeMessages(zhHantMessages, emailZhHantMessages),
    );

    i18n.activate('en');
  }
}
