import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Decorator } from '@storybook/react';
import { messages as enMessages } from '../../locales/generated/en';

i18n.load({
  en: enMessages,
});
i18n.activate('en');

export const I18nFrontDecorator: Decorator = (Story) => {
  return (
    <I18nProvider i18n={i18n}>
      <Story />
    </I18nProvider>
  );
};
