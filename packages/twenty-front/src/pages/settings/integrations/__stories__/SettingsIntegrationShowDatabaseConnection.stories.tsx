import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsIntegrationShowDatabaseConnection } from '~/pages/settings/integrations/SettingsIntegrationShowDatabaseConnection';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/Integrations/SettingsIntegrationShowDatabaseConnection',
  component: SettingsIntegrationShowDatabaseConnection,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPagePath(SettingsPath.IntegrationDatabaseConnection),
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

export type Story = StoryObj<typeof SettingsIntegrationShowDatabaseConnection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    within(canvasElement);
    sleep(1000);

    // Todo: Implement mocks in graphqlMocks for databaseConnection
    // await canvas.findByText('Tables');
  },
};
