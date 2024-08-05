import { SettingsServerlessFunctions } from '~/pages/settings/serverless-functions/SettingsServerlessFunctions';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { Meta, StoryObj } from '@storybook/react';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { sleep } from '~/utils/sleep';
import { within } from '@storybook/test';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/ServerlessFunctions/SettingsServerlessFunctions',
  component: SettingsServerlessFunctions,
  decorators: [PageDecorator],
  args: { routePath: '/settings/functions' },
  parameters: {
    msw: graphqlMocks,
  },
};
export default meta;

export type Story = StoryObj<typeof SettingsServerlessFunctions>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await sleep(100);

    await canvas.findByText('Functions');
    await canvas.findByText('Add your first Function');
  },
};
