import { ThemeProvider } from '@emotion/react';
import { Preview, ReactRenderer } from '@storybook/react';
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import { initialize, mswLoader } from 'msw-storybook-addon';

import { RootDecorator } from '../src/testing/decorators/RootDecorator';
import { mockedUserJWT } from '../src/testing/mock-data/jwt';

import { lightTheme, darkTheme } from '../src/modules/ui/theme/constants/theme';
import 'react-loading-skeleton/dist/skeleton.css';

initialize({ onUnhandledRequest: 'bypass' });

const preview: Preview = {
  decorators: [
    withThemeFromJSXProvider<ReactRenderer>({
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
    options: {
      storySort: {
        order: ['UI', 'Modules', 'Pages'],
      },
    },
    cookie: {
      tokenPair: `{%22accessToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-07-18T15:06:40.704Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22refreshToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-10-15T15:06:41.558Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22__typename%22:%22AuthTokenPair%22}`,
    },
    loaders: [mswLoader],
  },
};

export default preview;
