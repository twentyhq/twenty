import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsIntegrationNewDatabaseConnection } from '~/pages/settings/integrations/SettingsIntegrationNewDatabaseConnection';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Integrations/SettingsIntegrationNewDatabaseConnection',
  component: SettingsIntegrationNewDatabaseConnection,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/integrations/:databaseKey/new',
    routeParams: { ':databaseKey': 'postgresql' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsIntegrationNewDatabaseConnection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Connect a new database', undefined, {
      timeout: 3000,
    });
  },
};
