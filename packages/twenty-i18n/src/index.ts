import { i18n } from '@lingui/core';

import { messages as enMessages } from '../en/messages';
import { messages as frMessages } from '../fr/messages';
i18n.load('en', enMessages);
i18n.load('fr', frMessages);

i18n.activate('en');

export { i18n };
