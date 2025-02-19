import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsPath } from '@/types/SettingsPath';
import { SettingsIntegrations } from '~/pages/settings/integrations/SettingsIntegrations';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
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
