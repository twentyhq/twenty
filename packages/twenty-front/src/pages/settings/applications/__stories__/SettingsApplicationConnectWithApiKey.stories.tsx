import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { SettingsApplicationConnectWithApiKey } from '~/pages/settings/applications/SettingsApplicationConnectWithApiKey';

const APPLICATION_ID = '5a1d9a8e-4c43-4d6e-9f39-0f3b2f5a7c11';

const connectRequest = fn();

const connectionProvidersHandler = graphql.query(
  'ApplicationConnectionProviders',
  () =>
    HttpResponse.json({
      data: {
        applicationConnectionProviders: [
          {
            __typename: 'ApplicationConnectionProvider',
            id: '0d6f3c2e-8a51-4b0e-9d3a-6c1f2e7b8a90',
            applicationId: APPLICATION_ID,
            type: 'api-key',
            name: 'demo',
            displayName: 'Demo Service',
            scope: 'USER',
            logoUrl: null,
            oauth: null,
          },
        ],
      },
    }),
);

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Applications/SettingsApplicationConnectWithApiKey',
  component: SettingsApplicationConnectWithApiKey,
  decorators: [PageDecorator],
  args: {
    routePath:
      '/settings/applications/:applicationId/connect/:connectionProviderName',
    routeParams: {
      ':applicationId': APPLICATION_ID,
      ':connectionProviderName': 'demo',
    },
  },
  beforeEach: async () => {
    connectRequest.mockClear();
    await mockedApolloClient.clearStore();
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<PageDecoratorArgs>;

export const Connects: Story = {
  parameters: {
    msw: {
      handlers: [
        connectionProvidersHandler,
        graphql.mutation('ConnectApplicationWithApiKey', ({ variables }) => {
          connectRequest(variables.input);

          return HttpResponse.json({
            data: {
              connectApplicationWithApiKey:
                '7c3f1caf-6e65-4f80-9b5b-2b5d4c7c9e33',
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Paste a key from your Demo Service settings. It is stored encrypted.',
    );

    const saveButton = canvas.getByRole('button', { name: /Save/ });

    await expect(saveButton).toBeDisabled();

    await userEvent.type(canvas.getByLabelText('API key'), 'valid-key');
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(connectRequest).toHaveBeenCalledWith({
        applicationId: APPLICATION_ID,
        providerName: 'demo',
        apiKey: 'valid-key',
        reconnectingConnectedAccountId: null,
      }),
    );
  },
};

export const KeyNotVerified: Story = {
  parameters: {
    msw: {
      handlers: [
        connectionProvidersHandler,
        graphql.mutation('ConnectApplicationWithApiKey', () =>
          HttpResponse.json({
            data: null,
            errors: [
              {
                message: 'identifyAccount logic function failed',
                extensions: {
                  code: 'BAD_USER_INPUT',
                  userFriendlyMessage:
                    'We could not verify this key. Check it, or try again later if the service is down.',
                },
              },
            ],
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByLabelText('API key'), 'wrong-key');
    await userEvent.click(canvas.getByRole('button', { name: /Save/ }));

    await expect(
      await canvas.findByText(
        'We could not verify this key. Check it, or try again later if the service is down.',
      ),
    ).toBeVisible();
  },
};
