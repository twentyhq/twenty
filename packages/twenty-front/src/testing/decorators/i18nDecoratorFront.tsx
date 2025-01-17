import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { StoryFn } from '@storybook/react';
import { messages as enMessages } from '../../locales/generated/en';

i18n.load({
  en: enMessages,
});
i18n.activate('en');

export const i18nDecoratorFront = (Story: StoryFn) => {
  return (
    <I18nProvider i18n={i18n}>
      <Story />
    </I18nProvider>
  );
};
