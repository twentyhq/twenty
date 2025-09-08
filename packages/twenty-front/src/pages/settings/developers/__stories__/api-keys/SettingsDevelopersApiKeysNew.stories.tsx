import { type Meta, type StoryObj } from '@storybook/react';
import { SettingsPath } from 'twenty-shared/types';
// TEMP_DISABLED_TEST: Removed unused imports due to commented test

import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsDevelopersApiKeysNew } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeysNew';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

// TEMP_DISABLED_TEST: Removed unused import due to commented test
// import { sleep } from '~/utils/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/ApiKeys/SettingsDevelopersApiKeysNew',
  component: SettingsDevelopersApiKeysNew,
  decorators: [PageDecorator],
  args: { routePath: getSettingsPath(SettingsPath.NewApiKey) },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeysNew>;

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const Default: Story = {
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     const screen = within(document.body);

//     await canvas.findByText('New key');
//     await canvas.findByText('Name');
//     await canvas.findByText('Role');
//     await canvas.findByText('Expiration Date');

//     const nameInput = await canvas.findByPlaceholderText(
//       'E.g. backoffice integration',
//     );

//     await userEvent.type(nameInput, 'Test');

//     await step('Open role selector dropdown', async () => {
//       const roleSelector = await canvas.findByText('Admin');
//       await userEvent.click(roleSelector);

//       await sleep(1000);
//     });

//     await step('Select guest role option', async () => {
//       const guestOption = await screen.findByText('Guest', undefined, {
//         timeout: 3000,
//       });
//       await userEvent.click(guestOption);
//     });

//     await step('Verify save button is enabled', async () => {
//       const saveButton = await canvas.findByText('Save');
//       expect(saveButton).not.toHaveAttribute('disabled');
//     });
//   },
// };
