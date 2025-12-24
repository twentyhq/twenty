import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type Decorator } from '@storybook/react';
import { messages as enMessages } from '~/locales/generated/en';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

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
