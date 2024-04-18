import { Decorator } from '@storybook/react';
import { IconsProvider } from 'twenty-ui';

export const IconsProviderDecorator: Decorator = (Story) => {
  return (
    <IconsProvider>
      <Story />
    </IconsProvider>
  );
};
