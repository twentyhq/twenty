import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

import { SettingsProfile } from '~/pages/settings/profile/SettingsProfile';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsProfile',
  component: SettingsProfile,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/profile',
    additionalRoutes: ['/welcome'],
  },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);

    return () => {
      jotaiStore.set(currentWorkspaceMemberState.atom, null);
    };
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsProfile>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstName = await canvas.findByRole('textbox', {
      name: 'First Name',
    });
    const lastName = await canvas.findByRole('textbox', { name: 'Last Name' });

    expect(
      lastName.getBoundingClientRect().left -
        firstName.getBoundingClientRect().right,
    ).toBe(16);
  },
};
