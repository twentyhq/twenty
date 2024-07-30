import { SettingsServerlessFunctionsNew } from '~/pages/settings/serverless-functions/SettingsServerlessFunctionsNew';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { Meta, StoryObj } from '@storybook/react';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { userEvent, within } from '@storybook/test';
import { sleep } from '~/utils/sleep';

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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await sleep(100);
    await canvas.findByText('Functions');
    await canvas.findByText('New');

    const input = await canvas.findByPlaceholderText('Name');
    await userEvent.type(input, 'Function Name');
    const saveButton = await canvas.findByText('Save');

    await userEvent.click(saveButton);
  },
};
