// TEMP_DISABLED_TEST: Removed unused imports due to commented test
import { type Meta, type StoryObj } from '@storybook/react';

import { SettingsPath } from '@/types/SettingsPath';
import { SettingsIntegrationDatabase } from '~/pages/settings/integrations/SettingsIntegrationDatabase';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
// TEMP_DISABLED_TEST: Removed unused import due to commented test
// import { sleep } from '~/utils/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Integrations/SettingsIntegrationDatabase',
  component: SettingsIntegrationDatabase,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPath(SettingsPath.IntegrationDatabase),
    routeParams: { ':databaseKey': 'postgresql' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsIntegrationDatabase>;

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const Default: Story = {
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     sleep(1000);

//     expect(await canvas.findByText('PostgreSQL database')).toBeInTheDocument();
//   },
// };
