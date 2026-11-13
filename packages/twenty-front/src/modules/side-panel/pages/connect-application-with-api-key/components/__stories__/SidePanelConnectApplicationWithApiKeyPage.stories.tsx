import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SidePanelConnectApplicationWithApiKeyPage } from '@/side-panel/pages/connect-application-with-api-key/components/SidePanelConnectApplicationWithApiKeyPage';
import { connectApplicationWithApiKeyTargetComponentState } from '@/side-panel/pages/connect-application-with-api-key/states/connectApplicationWithApiKeyTargetComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const PAGE_CONTEXT = { instanceId: 'connect-application-with-api-key-story' };

const connectRequest = fn();

const meta = {
  title: 'Modules/SidePanel/ConnectApplicationWithApiKey',
  component: SidePanelConnectApplicationWithApiKeyPage,
  decorators: [
    (Story) => (
      <SidePanelPageComponentInstanceContext.Provider value={PAGE_CONTEXT}>
        <Story />
      </SidePanelPageComponentInstanceContext.Provider>
    ),
    MemoryRouterDecorator,
    ComponentDecorator,
    ToastDecorator,
  ],
  beforeEach: () => {
    connectRequest.mockClear();
    jotaiStore.set(
      connectApplicationWithApiKeyTargetComponentState.atomFamily(PAGE_CONTEXT),
      {
        applicationId: '5a1d9a8e-4c43-4d6e-9f39-0f3b2f5a7c11',
        providerName: 'demo',
        providerDisplayName: 'Demo Service',
        reconnectingConnectedAccountId: null,
      },
    );
  },
} satisfies Meta<typeof SidePanelConnectApplicationWithApiKeyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connects: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ConnectApplicationWithApiKey', ({ variables }) => {
          connectRequest(variables.input);

          return HttpResponse.json({
            data: {
              connectApplicationWithApiKey:
                '7c3f1caf-6e65-4f80-9b5b-2b5d4c7c9e33',
            },
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const connectButton = await canvas.findByRole('button', {
      name: /Connect/,
    });

    await expect(connectButton).toBeDisabled();

    await userEvent.type(canvas.getByLabelText('API key'), 'valid-key');
    await userEvent.click(connectButton);

    await waitFor(() =>
      expect(connectRequest).toHaveBeenCalledWith({
        applicationId: '5a1d9a8e-4c43-4d6e-9f39-0f3b2f5a7c11',
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
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByLabelText('API key'), 'wrong-key');
    await userEvent.click(canvas.getByRole('button', { name: /Connect/ }));

    await expect(
      await canvas.findByText(
        'We could not verify this key. Check it, or try again later if the service is down.',
      ),
    ).toBeVisible();
  },
};
