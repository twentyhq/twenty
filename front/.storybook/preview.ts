import { initialize, mswDecorator } from 'msw-storybook-addon';
import { Preview } from '@storybook/react';

initialize();

const preview: Preview = {
  decorators: [mswDecorator],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;