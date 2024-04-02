import { Meta, StoryObj } from '@storybook/react';

import { SettingsIntegrationNewDatabase } from '~/pages/settings/integrations/SettingsIntegrationNewDatabase';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Integrations/SettingsIntegrationNewDatabase',
  component: SettingsIntegrationNewDatabase,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/integrations/:integrationKey/new',
    routeParams: { ':integrationKey': 'postgresql' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsIntegrationNewDatabase>;

export const Default: Story = {};
