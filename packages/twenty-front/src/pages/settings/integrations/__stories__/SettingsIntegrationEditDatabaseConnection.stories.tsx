import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsIntegrationEditDatabaseConnection } from '~/pages/settings/integrations/SettingsIntegrationEditDatabaseConnection';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/Integrations/SettingsIntegrationEditDatabaseConnection',
  component: SettingsIntegrationEditDatabaseConnection,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/integrations/:databaseKey/edit',
    routeParams: {
      ':databaseKey': 'postgresql',
      ':connectionId': '67cbfd35-8dd4-4591-b9d4-c1906281a5da',
    },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsIntegrationEditDatabaseConnection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    sleep(100);

    await canvas.findByText('Edit Connection', undefined, { timeout: 3000 });
  },
};
