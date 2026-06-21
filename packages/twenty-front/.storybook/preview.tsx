import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type Preview } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

// oxlint-disable-next-line no-restricted-imports
import { DateFormat } from '../src/modules/localization/constants/DateFormat';
// oxlint-disable-next-line no-restricted-imports
import { TimeFormat } from '../src/modules/localization/constants/TimeFormat';
// oxlint-disable-next-line no-restricted-imports
import { FileUploadProvider } from '../src/modules/file-upload/components/FileUploadProvider';
// oxlint-disable-next-line no-restricted-imports
import { RootDecorator } from '../src/testing/decorators/RootDecorator';
// oxlint-disable-next-line no-restricted-imports
import { resetJotaiStore } from '../src/modules/ui/utilities/state/jotai/jotaiStore';
// oxlint-disable-next-line no-restricted-imports
import { UserContext } from '../src/modules/users/contexts/UserContext';

import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';
import { ThemeProvider } from 'twenty-ui/theme-constants';
// oxlint-disable-next-line no-restricted-imports
import { messages as enMessages } from '../src/locales/generated/en';

// Initialize i18n globally for all stories
i18n.load({ [SOURCE_LOCALE]: enMessages });
i18n.activate(SOURCE_LOCALE);
import { mockedUserJWT } from '~/testing/mock-data/jwt';
// oxlint-disable-next-line no-restricted-imports
import { ClickOutsideListenerContext } from '../src/modules/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';

const MOCK_IMAGE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192"><rect width="192" height="192" fill="#d9d9d9"/></svg>';

const respondWithMockImage = () =>
  new HttpResponse(MOCK_IMAGE_SVG, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });

const remoteImageMockHandlers = [
  http.get('https://picsum.photos/*', respondWithMockImage),
  http.get('https://twenty-icons.com/*', respondWithMockImage),
  http.get('https://twentyhq.github.io/*', respondWithMockImage),
  http.get('https://via.placeholder.com/*', respondWithMockImage),
  http.get(
    'https://twenty-front-screenshots.s3.eu-west-3.amazonaws.com/*',
    respondWithMockImage,
  ),
];

initialize(
  {
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

        // oxlint-disable-next-line no-console
        console.warn(`Unhandled ${request.method} request to ${request.url}
        with payload ${JSON.stringify(requestBody)}\n
        This request should be mocked with MSW`);
      } catch (error) {
        // oxlint-disable-next-line no-console
        console.error(`Cannot parse msw request body : ${error}`);
      }

      // oxlint-disable-next-line no-console
      console.warn(
        `Unhandled ${request.method} request to ${request.url} \n  This request should be mocked with MSW`,
      );
    },
    quiet: true,
  },
  remoteImageMockHandlers,
);

// Mirrors production's MinimalMetadataGater so any story rendering a
// date-aware component (DateTimeDisplay, etc.) sees a real IANA timeZone
// instead of UserContext's default `{}`. Stories needing a specific timezone
// can still override by nesting their own UserContext.Provider.
const STORYBOOK_DEFAULT_USER_CONTEXT = {
  dateFormat: DateFormat.DAY_FIRST,
  timeFormat: TimeFormat.HOUR_24,
  timeZone: 'UTC',
};

const INTER_FONT_WEIGHTS = ['400', '500', '600'];

const waitForInterFontLoadedBeforeScreenshot = async () => {
  await Promise.all(
    INTER_FONT_WEIGHTS.map((weight) =>
      document.fonts.load(`${weight} 1em Inter`),
    ),
  );
  await document.fonts.ready;
};

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <I18nProvider i18n={i18n}>
          <ThemeProvider colorScheme="light">
            <FileUploadProvider>
              <ClickOutsideListenerContext.Provider
                value={{ excludedClickOutsideId: undefined }}
              >
                <UserContext.Provider value={STORYBOOK_DEFAULT_USER_CONTEXT}>
                  <Story />
                </UserContext.Provider>
              </ClickOutsideListenerContext.Provider>
            </FileUploadProvider>
          </ThemeProvider>
        </I18nProvider>
      );
    },
    RootDecorator,
  ],

  beforeEach: () => {
    resetJotaiStore();
  },

  loaders: [mswLoader, waitForInterFontLoadedBeforeScreenshot],

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
