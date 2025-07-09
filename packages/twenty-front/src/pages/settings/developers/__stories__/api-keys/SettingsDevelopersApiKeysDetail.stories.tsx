import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, userEvent, within } from '@storybook/test';

import { SettingsDevelopersApiKeyDetail } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeyDetail';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
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
    msw: graphqlMocks,
  },
};
export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeyDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Zapier Integration', undefined, { timeout: 3000 });
  },
};

export const RegenerateApiKey: Story = {
  play: async ({ step }) => {
    const canvas = within(document.body);
    await canvas.findByText('Zapier Integration', undefined, { timeout: 3000 });

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
    await canvas.findByText('Zapier Integration', undefined, { timeout: 3000 });

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
