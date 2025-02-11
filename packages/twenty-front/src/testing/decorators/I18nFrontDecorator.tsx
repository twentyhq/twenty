import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Decorator } from '@storybook/react';
import { SOURCE_LOCALE } from 'twenty-shared';
import { messages as enMessages } from '../../locales/generated/en';

i18n.load({
  [SOURCE_LOCALE]: enMessages,
});
i18n.activate(SOURCE_LOCALE);

export const I18nFrontDecorator: Decorator = (Story) => {
  return (
    <I18nProvider i18n={i18n}>
      <Story />
    </I18nProvider>
  );
};
