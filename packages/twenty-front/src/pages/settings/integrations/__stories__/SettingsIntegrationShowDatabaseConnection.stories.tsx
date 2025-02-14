import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsPath } from '@/types/SettingsPath';
import { SettingsIntegrationShowDatabaseConnection } from '~/pages/settings/integrations/SettingsIntegrationShowDatabaseConnection';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { sleep } from '~/utils/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/Integrations/SettingsIntegrationShowDatabaseConnection',
  component: SettingsIntegrationShowDatabaseConnection,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPath(SettingsPath.IntegrationDatabaseConnection),
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
