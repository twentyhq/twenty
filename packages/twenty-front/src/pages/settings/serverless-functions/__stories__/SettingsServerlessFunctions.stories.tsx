import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { SettingsServerlessFunctions } from '~/pages/settings/serverless-functions/SettingsServerlessFunctions';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

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

    await canvas.findByText('Add your first Function');
  },
};
