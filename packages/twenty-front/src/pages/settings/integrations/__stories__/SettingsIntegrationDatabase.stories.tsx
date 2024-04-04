import { Meta, StoryObj } from '@storybook/react';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsIntegrationDatabase } from '~/pages/settings/integrations/SettingsIntegrationDatabase';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Integrations/SettingsIntegrationDatabase',
  component: SettingsIntegrationDatabase,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPagePath(SettingsPath.IntegrationDatabase),
    routeParams: { ':databaseKey': 'postgresql' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsIntegrationDatabase>;

export const Default: Story = {};
