import { type Meta, type StoryObj } from '@storybook/react-vite';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

import { SettingsGeneral } from '~/pages/settings/general/SettingsGeneral';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsGeneral',
  component: SettingsGeneral,
  decorators: [PageDecorator],
  args: { routePath: '/settings/general' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsGeneral>;

export const Default: Story = {};

export const GeneralWithLogsFlag: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED, value: true },
      ],
    });
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: Object.values(PermissionFlagType),
    });
  },
};
