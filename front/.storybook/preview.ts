import { initialize, mswDecorator } from 'msw-storybook-addon';
import { Preview } from '@storybook/react';
import { ThemeProvider } from '@emotion/react';
import { withThemeFromJSXProvider } from '@storybook/addon-styling';
import { lightTheme, darkTheme } from '../src/modules/ui/themes/themes';
import { RootDecorator } from '../src/testing/decorators';
import 'react-loading-skeleton/dist/skeleton.css';
import { mockedUserJWT } from '../src/testing/mock-data/jwt';
initialize();

const preview: Preview = {
  decorators: [
    mswDecorator,
    withThemeFromJSXProvider({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
    }),
    RootDecorator,
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    cookie: {
      tokenPair: `{%22accessToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-07-18T15:06:40.704Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22refreshToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-10-15T15:06:41.558Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22__typename%22:%22AuthTokenPair%22}`,
    },
    options: {
      storySort: {
        order: ['UI', 'Modules', 'Pages'],
      },
    },
  },
};

export default preview;
