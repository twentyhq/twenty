import { ThemeProvider } from '@emotion/react';
import { type Preview } from '@storybook/react';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';

import { RootDecorator } from '../src/testing/decorators/RootDecorator';
import { mockedUserJWT } from '../src/testing/mock-data/jwt';
import { cookieStorage } from '../src/utils/cookie-storage';

import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import { THEME_DARK, THEME_LIGHT, ThemeContextProvider } from 'twenty-ui/theme';

initialize({
  onUnhandledRequest: async (request: Request) => {
    const fileExtensionsToIgnore =
      /\.(ts|tsx|js|jsx|svg|css|png|woff2)(\?v=[a-zA-Z0-9]+)?/;

    if (fileExtensionsToIgnore.test(request.url)) {
      return;
    }

    if (request.url.startsWith('http://localhost:3000/files/data:image')) {
      return;
    }

    const requestBody = await request.json();
    // eslint-disable-next-line no-console
    console.warn(`Unhandled ${request.method} request to ${request.url} 
      with payload ${JSON.stringify(requestBody)}\n
      This request should be mocked with MSW`);
  },
  quiet: true,
});

const preview: Preview = {
  decorators: [
    (Story) => {
      const theme = useDarkMode() ? THEME_DARK : THEME_LIGHT;

      useEffect(() => {
        document.documentElement.className =
          theme.name === 'dark' ? 'dark' : 'light';
      }, [theme]);

      useEffect(() => {
        const tokenPair = {
          accessOrWorkspaceAgnosticToken: {
            token: mockedUserJWT,
            expiresAt: '2023-07-18T15:06:40.704Z',
            __typename: 'AuthToken',
          },
          refreshToken: {
            token: mockedUserJWT,
            expiresAt: '2023-10-15T15:06:41.558Z',
            __typename: 'AuthToken',
          },
          __typename: 'AuthTokenPair',
        };
        
        cookieStorage.setItem('tokenPair', JSON.stringify(tokenPair));
      }, []);

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
    mswDecorator,
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
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
  },
};

export default preview;
