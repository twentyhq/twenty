import { initialize, mswDecorator } from 'msw-storybook-addon';
import { Preview } from '@storybook/react';
import { ThemeProvider } from '@emotion/react';
import { withThemeFromJSXProvider } from "@storybook/addon-styling";
import { lightTheme, darkTheme } from '../src/modules/ui/themes/themes';

initialize();

const preview: Preview = {
  decorators: [
    mswDecorator,
    withThemeFromJSXProvider({
        themes: {
          light: lightTheme,
          dark: darkTheme,
        },
        defaultTheme: "light",
        Provider: ThemeProvider,
      })
  ],
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