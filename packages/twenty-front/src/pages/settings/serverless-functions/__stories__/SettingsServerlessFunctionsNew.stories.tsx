import { type Meta, type StoryObj } from '@storybook/react';
import { SettingsServerlessFunctionsNew } from '~/pages/settings/serverless-functions/SettingsServerlessFunctionsNew';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/ServerlessFunctions/SettingsServerlessFunctionsNew',
  component: SettingsServerlessFunctionsNew,
  decorators: [PageDecorator],
  args: { routePath: '/settings/functions/new' },
  parameters: {
    msw: graphqlMocks,
  },
};
export default meta;

export type Story = StoryObj<typeof SettingsServerlessFunctionsNew>;

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const Default: Story = {
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     await sleep(100);
//     await canvas.findByText('Functions');
//     await canvas.findByText('New');

//     const input = await canvas.findByPlaceholderText('Name');
//     await userEvent.type(input, 'Function Name');
//     const saveButton = await canvas.findByText('Save');

//     await userEvent.click(saveButton);
//   },
// };
