import { Injectable, OnModuleInit } from '@nestjs/common';

import { i18n } from '@lingui/core';

import { messages as enMessages } from 'src/engine/core-modules/i18n/locales/generated/en.js';
import { messages as frMessages } from 'src/engine/core-modules/i18n/locales/generated/fr.js';

@Injectable()
export class I18nService implements OnModuleInit {
  async onModuleInit() {
    i18n.load('fr', frMessages);
    i18n.load('en', enMessages);

    i18n.activate('en');
  }
}
