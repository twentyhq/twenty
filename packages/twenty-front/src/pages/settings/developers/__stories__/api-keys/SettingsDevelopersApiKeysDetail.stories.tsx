import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, userEvent, within } from '@storybook/test';
import { HttpResponse } from 'msw';

import { SettingsDevelopersApiKeyDetail } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeyDetail';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/ApiKeys/SettingsDevelopersApiKeyDetail',
  component: SettingsDevelopersApiKeyDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/apis/:apiKeyId',
    routeParams: {
      ':apiKeyId': 'f7c6d736-8fcd-4e9c-ab99-28f6a9031570',
    },
  },
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        metadataGraphql.query('GetApiKey', ({ variables }) => {
          const apiKeyId = variables.input?.id;
          if (apiKeyId === 'f7c6d736-8fcd-4e9c-ab99-28f6a9031570') {
            return HttpResponse.json({
              data: {
                apiKey: {
                  __typename: 'ApiKey',
                  id: 'f7c6d736-8fcd-4e9c-ab99-28f6a9031570',
                  revokedAt: null,
                  expiresAt: '2024-03-10T09:23:10.511Z',
                  name: 'New API Key',
                  updatedAt: '2024-02-24T10:23:10.673Z',
                  createdAt: '2024-02-24T10:23:10.673Z',
                },
              },
            });
          }
          return HttpResponse.json({ data: { apiKey: null } });
        }),
      ],
    },
  },
};
export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeyDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New API Key', undefined, { timeout: 3000 });
  },
};

export const RegenerateApiKey: Story = {
  play: async ({ step }) => {
    const canvas = within(document.body);
    await canvas.findByText('New API Key', undefined, { timeout: 3000 });

    await userEvent.click(await canvas.findByText('Regenerate Key'));

    await canvas.findByText('Cancel');

    const confirmationInput = await canvas.findByTestId(
      'confirmation-modal-input',
    );

    fireEvent.change(confirmationInput, {
      target: { value: 'yes' },
    });

    const confirmButton = await canvas.findByTestId(
      'confirmation-modal-confirm-button',
    );

    await step('Click on confirm button', async () => {
      await sleep(1000);
      await userEvent.click(confirmButton);
    });
  },
};

export const DeleteApiKey: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New API Key', undefined, { timeout: 3000 });

    await userEvent.click(await canvas.findByText('Delete'));

    await canvas.findByText('Cancel');
    const confirmationInput = await canvas.findByTestId(
      'confirmation-modal-input',
    );

    fireEvent.change(confirmationInput, {
      target: { value: 'yes' },
    });

    const confirmButton = await canvas.findByTestId(
      'confirmation-modal-confirm-button',
    );

    await step('Click on confirm button', async () => {
      await sleep(1000);
      await userEvent.click(confirmButton);
    });
  },
};
