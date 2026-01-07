import { ThemeProvider } from '@emotion/react';
import { type Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { useEffect } from 'react';
//import { useDarkMode } from 'storybook-dark-mode';

// eslint-disable-next-line no-restricted-imports
import { RootDecorator } from '../src/testing/decorators/RootDecorator';
// eslint-disable-next-line no-restricted-imports
import { mockedUserJWT } from '../src/testing/mock-data/jwt';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import { THEME_LIGHT, ThemeContextProvider } from 'twenty-ui/theme';
// eslint-disable-next-line no-restricted-imports
import { ClickOutsideListenerContext } from '../src/modules/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';

initialize({
  onUnhandledRequest: async (request: Request) => {
    const fileExtensionsToIgnore =
      /\.(ts|tsx|js|jsx|svg|css|png|woff2)(\?v=[a-zA-Z0-9]+)?/;

    if (fileExtensionsToIgnore.test(request.url)) {
      return;
    }

    if (request.url.startsWith('http://localhost:3000/files/')) {
      return;
    }

    try {
      const requestBody = await request.json();

      // eslint-disable-next-line no-console
      console.warn(`Unhandled ${request.method} request to ${request.url}
        with payload ${JSON.stringify(requestBody)}\n
        This request should be mocked with MSW`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Cannot parse msw request body : ${error}`);
    }

    // eslint-disable-next-line no-console
    console.warn(
      `Unhandled ${request.method} request to ${request.url} \n  This request should be mocked with MSW`,
    );
  },
  quiet: true,
});

const preview: Preview = {
  decorators: [
    (Story) => {
      // const theme = useDarkMode() ? THEME_DARK : THEME_LIGHT;
      const theme = THEME_LIGHT;

      useEffect(() => {
        document.documentElement.className =
          theme.name === 'dark' ? 'dark' : 'light';
      }, [theme]);

      return (
        <ThemeProvider theme={theme}>
          <ThemeContextProvider theme={theme}>
            <ClickOutsideListenerContext.Provider
              value={{ excludedClickOutsideId: undefined }}
            >
              <Story />
            </ClickOutsideListenerContext.Provider>
          </ThemeContextProvider>
        </ThemeProvider>
      );
    },
    RootDecorator,
  ],

  loaders: [mswLoader],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    mockingDate: new Date('2024-03-12T09:30:00.000Z'),
    options: {
      storySort: {
        order: ['UI', 'Modules', 'Pages'],
      },
    },
    cookie: {
      tokenPair: `{%22accessOrWorkspaceAgnosticToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-07-18T15:06:40.704Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22refreshToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-10-15T15:06:41.558Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22__typename%22:%22AuthTokenPair%22}`,
    },
  },
};

export default preview;
