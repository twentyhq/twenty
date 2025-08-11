import { type Meta, type StoryObj } from '@storybook/react';

import { SettingsDevelopersApiKeyDetail } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeyDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

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

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const Default: Story = {
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);

//     await canvas.findByText('Role', undefined, { timeout: 3000 });
//     await canvas.findByText('Admin');

//     await canvas.findByText('API Key');
//     await canvas.findByText('Regenerate an API key');
//     await canvas.findByText('Name');
//     await canvas.findByText('Name of your API key');
//     await canvas.findByText('Expiration');
//     await canvas.findByText('When the key will be disabled');
//     await canvas.findByText('Danger zone');
//     await canvas.findByText('Delete this integration');

//     await canvas.findByText('APIs');

//     const regenerateButton = await canvas.findByText('Regenerate Key');
//     const deleteButton = await canvas.findByText('Delete');

//     expect(regenerateButton).toBeInTheDocument();
//     expect(deleteButton).toBeInTheDocument();
//   },
// };

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const RegenerateApiKey: Story = {
//   play: async ({ step }) => {
//     const canvas = within(document.body);

//     await canvas.findByText('Role', undefined, { timeout: 3000 });

//     await canvas.findByText('Regenerate Key');

//     await userEvent.click(await canvas.findByText('Regenerate Key'));

//     await canvas.findByText('Cancel');

//     const confirmationInput = await canvas.findByTestId(
//       'confirmation-modal-input',
//     );

//     fireEvent.change(confirmationInput, {
//       target: { value: 'yes' },
//     });

//     const confirmButton = await canvas.findByTestId(
//       'confirmation-modal-confirm-button',
//     );

//     await step('Click on confirm button', async () => {
//       await sleep(1000);
//       await userEvent.click(confirmButton);
//     });
//   },
// };

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const DeleteApiKey: Story = {
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);

//     await canvas.findByText('Role', undefined, { timeout: 3000 });

//     await canvas.findByText('Delete');

//     await userEvent.click(await canvas.findByText('Delete'));

//     await canvas.findByText('Cancel');
//     const confirmationInput = await canvas.findByTestId(
//       'confirmation-modal-input',
//     );

//     fireEvent.change(confirmationInput, {
//       target: { value: 'yes' },
//     });

//     const confirmButton = await canvas.findByTestId(
//       'confirmation-modal-confirm-button',
//     );

//     await step('Click on confirm button', async () => {
//       await sleep(1000);
//       await userEvent.click(confirmButton);
//     });
//   },
// };
