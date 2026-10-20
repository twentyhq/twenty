import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsNativeApplicationDetails } from '~/pages/settings/applications/SettingsNativeApplicationDetails';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Applications/SettingsNativeApplicationDetails',
  component: SettingsNativeApplicationDetails,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/applications/native/:nativeAccountAppId',
    routeParams: { ':nativeAccountAppId': 'google' },
    additionalRoutes: ['/settings/applications'],
  },
  beforeEach: () => {
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(isGoogleCalendarEnabledState.atom, true);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
          value: true,
        },
      ],
    });
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsNativeApplicationDetails>;

export const Google: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Sync emails and calendar events from your Google accounts.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(canvas.getByTestId('tab-general')).toBeVisible();
    expect(canvas.queryByText('Uninstall')).not.toBeInTheDocument();
  },
};
