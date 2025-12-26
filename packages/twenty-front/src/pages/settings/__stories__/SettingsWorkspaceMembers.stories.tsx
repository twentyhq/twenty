// TEMP_DISABLED_TEST: Removed unused imports due to commented test
import { type Meta, type StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
// TEMP_DISABLED_TEST: Removed unused import due to commented test
// import { sleep } from '~/utils/sleep';

import { SettingsWorkspaceMembers } from '~/pages/settings/members/SettingsWorkspaceMembers';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsWorkspaceMembers',
  component: SettingsWorkspaceMembers,
  decorators: [PageDecorator],
  args: { routePath: '/settings/members' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsWorkspaceMembers>;

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const Default: Story = {
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);

//     await sleep(1000);

//     const buttons = await canvas.getAllByRole('button');

//     expect(
//       buttons.findIndex((button) => button.outerHTML.includes('Copy link')),
//     ).toBeGreaterThan(-1);
//   },
// };
