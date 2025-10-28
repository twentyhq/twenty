import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsIntegrations } from '~/pages/settings/integrations/SettingsIntegrations';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { sleep } from '~/utils/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Integrations/SettingsIntegrations',
  component: SettingsIntegrations,
  decorators: [PageDecorator],
  args: { routePath: getSettingsPath(SettingsPath.Integrations) },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsIntegrations>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    await canvas.findByText('Go to GitHub');
  },
};
