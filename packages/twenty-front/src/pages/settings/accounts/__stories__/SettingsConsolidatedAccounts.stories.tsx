import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  PermissionFlagType,
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';
import { SettingsAccountDetail } from '~/pages/settings/accounts/SettingsAccountDetail';
import { SettingsAccounts } from '~/pages/settings/accounts/SettingsAccounts';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import {
  ACCOUNT_GROUP_PATH,
  FATHOM_ACCOUNT,
  FATHOM_ACCOUNT_ID,
  FATHOM_APPLICATION_ID,
  GOOGLE_ACCOUNT,
  GOOGLE_ACCOUNT_ID,
  GOOGLE_CALENDAR_CHANNEL_ID,
  GOOGLE_MESSAGE_CHANNEL_ID,
  SHARED_GOOGLE_ACCOUNT,
  SHARED_GOOGLE_ACCOUNT_ID,
  SHARED_MESSAGE_CHANNEL_ID,
  SHARED_CALENDAR_CHANNEL_ID,
  createConsolidatedAccount,
  createConsolidatedAccountsScenario,
  createConsolidatedCalendarChannel,
  createConsolidatedMessageChannel,
} from './mockedConsolidatedAccounts';

const StyledStoryToolbar = styled.div`
  background: ${themeCssVariables.background.primary};
  bottom: ${themeCssVariables.spacing[4]};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  max-width: min(440px, calc(100vw - ${themeCssVariables.spacing[8]}));
  padding: ${themeCssVariables.spacing[2]};
  position: fixed;
  right: ${themeCssVariables.spacing[4]};

  output {
    flex-basis: 100%;
    font-size: ${themeCssVariables.font.size.xs};
    overflow-wrap: anywhere;
  }
`;

const ConsolidatedAccountsFlow = ({
  initialPath = '/settings/accounts',
}: {
  initialPath?: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route
          element={
            <SettingsProtectedRouteWrapper
              settingsPermission={PermissionFlagType.CONNECTED_ACCOUNTS}
            />
          }
        >
          <Route path="/settings/accounts" element={<SettingsAccounts />} />
          <Route
            path="/settings/accounts/detail/:accountGroupId"
            element={<SettingsAccountDetail />}
          />
        </Route>
        <Route path="/settings/profile" element={<div>Profile settings</div>} />
        <Route
          path="/settings/accounts/new"
          element={<div>Connect a new account</div>}
        />
        <Route
          path="/settings/accounts/configuration/:connectedAccountId"
          element={<div>Complete connection setup</div>}
        />
        <Route
          path="/settings/accounts/edit-imap-smtp-caldav-connection/:connectedAccountId"
          element={<div>Edit connection settings</div>}
        />
        <Route path="*" element={<Navigate to={initialPath} replace />} />
      </Routes>
      <StyledStoryToolbar>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="outline" onClick={() => navigate(1)}>
          Forward
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            mockedApolloClient.refetchQueries({
              include: ['MyConsolidatedConnectedAccounts'],
            })
          }
        >
          Refresh connections
        </Button>
        <output aria-label="Current location">
          {location.pathname}
          {location.search}
          {location.hash}
        </output>
      </StyledStoryToolbar>
    </>
  );
};

const defaultScenario = createConsolidatedAccountsScenario();
const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/ConsolidatedAccounts',
  component: SettingsAccounts,
  decorators: [PageDecorator],
  args: { routePath: '/*' },
  parameters: { layout: 'fullscreen', msw: defaultScenario.mocks },
  beforeEach: defaultScenario.prepare,
  render: () => <ConsolidatedAccountsFlow />,
};
export default meta;
type Story = StoryObj<typeof meta>;

const openGroupMenu = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await userEvent.click(
    await canvas.findByRole('button', {
      name: 'More options for tim@apple.dev',
    }),
  );
  return canvas;
};

export const GoogleAndFathomSameEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const account = await canvas.findByRole('link', { name: /tim@apple.dev/ });
    await expect(
      canvas.getAllByRole('link', { name: /tim@apple.dev/ }),
    ).toHaveLength(1);
    await expect(await within(account).findByLabelText('Gmail')).toBeVisible();
    await expect(
      await within(account).findByLabelText('Google Calendar'),
    ).toBeVisible();
    await expect(within(account).getByLabelText('Fathom')).toBeVisible();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await expect(defaultScenario.readProviders).not.toHaveBeenCalled();

    const body = await openGroupMenu(canvasElement);
    await expect(
      body.getByRole('menuitem', { name: 'Account settings' }),
    ).toHaveAttribute('href', ACCOUNT_GROUP_PATH);
    await expect(
      body.queryByRole('menuitem', { name: 'Emails settings' }),
    ).not.toBeInTheDocument();
    await expect(
      body.queryByRole('menuitem', { name: 'Calendar settings' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Shared accounts between apps'),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(account);
    await canvas.findByText('Personal Inbox');
    const accountAppTabs = canvas.getAllByRole('tab');
    await expect(accountAppTabs).toHaveLength(3);
    await expect(accountAppTabs[0]).toHaveAccessibleName('Gmail');
    await expect(accountAppTabs[1]).toHaveAccessibleName('Google Calendar');
    await expect(accountAppTabs[2]).toHaveAccessibleName('Fathom');
    await expect(canvas.getByRole('tab', { name: 'Gmail' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(defaultScenario.readProviders).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
    await waitFor(() =>
      expect(defaultScenario.updateMessageChannel).toHaveBeenCalledWith({
        id: GOOGLE_MESSAGE_CHANNEL_ID,
        update: { visibility: MessageChannelVisibility.METADATA },
      }),
    );
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Metadata' })).toBeChecked(),
    );

    await userEvent.click(canvas.getByRole('tab', { name: 'Google Calendar' }));
    await canvas.findByText('Event visibility');
    await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
    await waitFor(() =>
      expect(defaultScenario.updateCalendarChannel).toHaveBeenCalledWith({
        id: GOOGLE_CALENDAR_CHANNEL_ID,
        update: { visibility: CalendarChannelVisibility.METADATA },
      }),
    );
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Metadata' })).toBeChecked(),
    );

    await userEvent.click(canvas.getByRole('tab', { name: 'Fathom' }));
    await canvas.findByText('Fathom account');
    await expect(canvas.getByText('recordings:read')).toBeVisible();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(defaultScenario.readProviders).toHaveBeenCalledWith(
      FATHOM_APPLICATION_ID,
    );
    const detailMenu = await openGroupMenu(canvasElement);
    await expect(
      detailMenu.queryByRole('menuitem', { name: 'Account settings' }),
    ).not.toBeInTheDocument();
    await expect(
      detailMenu.getByRole('menuitem', { name: 'Disconnect connection' }),
    ).toBeVisible();
    await expect(
      detailMenu.getByRole('menuitem', { name: 'Delete connection' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

const disconnectScenario = createConsolidatedAccountsScenario({
  accounts: [GOOGLE_ACCOUNT, FATHOM_ACCOUNT, SHARED_GOOGLE_ACCOUNT],
});
export const DisconnectListsManageableAndRetainedConnections: Story = {
  parameters: { msw: disconnectScenario.mocks },
  beforeEach: disconnectScenario.prepare,
  play: async ({ canvasElement }) => {
    const canvas = await openGroupMenu(canvasElement);
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'Disconnect account' }),
    );
    const dialog = await canvas.findByRole('dialog', {
      name: 'Disconnect account',
    });
    await expect(dialog).toHaveTextContent('Google');
    await expect(dialog).toHaveTextContent('Fathom');
    await expect(dialog).toHaveTextContent(
      'My Google connection · Personal · You',
    );
    await expect(dialog).toHaveTextContent(
      'My Fathom connection · Personal · You',
    );
    await expect(dialog).toHaveTextContent(
      'Team Google connection · Shared · Another member',
    );
    await expect(dialog).toHaveTextContent(
      'Retained — shared, managed by its owner',
    );
    await expect(dialog).toHaveTextContent(
      'Native emails and events will be retained',
    );
    await expect(dialog).toHaveTextContent(
      'Installed apps will remain installed',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Disconnect account' }),
    );
    await waitFor(() =>
      expect(disconnectScenario.disconnect).toHaveBeenCalledTimes(2),
    );
    await expect(disconnectScenario.disconnect).toHaveBeenCalledWith(
      GOOGLE_ACCOUNT_ID,
    );
    await expect(disconnectScenario.disconnect).toHaveBeenCalledWith(
      FATHOM_ACCOUNT_ID,
    );
    await expect(disconnectScenario.disconnect).not.toHaveBeenCalledWith(
      SHARED_GOOGLE_ACCOUNT_ID,
    );
    await canvas.findByText('Partially disconnected');
    await expect(
      canvas.getByRole('link', { name: /tim@apple.dev/ }),
    ).toBeVisible();
    await expect(disconnectScenario.deleteConnection).not.toHaveBeenCalled();
  },
};

const partialDisconnectScenario = createConsolidatedAccountsScenario({
  disconnectFailureId: FATHOM_ACCOUNT_ID,
});
export const PartialDisconnectRetriesOnlyFailedRecordAndResetsForReconnect: Story =
  {
    parameters: { msw: partialDisconnectScenario.mocks },
    beforeEach: partialDisconnectScenario.prepare,
    play: async ({ canvasElement }) => {
      const canvas = await openGroupMenu(canvasElement);
      await userEvent.click(
        canvas.getByRole('menuitem', { name: 'Disconnect account' }),
      );
      let dialog = await canvas.findByRole('dialog', {
        name: 'Disconnect account',
      });
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Disconnect account' }),
      );
      await canvas.findByText(
        'Some connections could not be updated. Retry to update the remaining connections.',
      );
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
      await canvas.findByText('Partially disconnected');
      await expect(partialDisconnectScenario.disconnect).toHaveBeenCalledTimes(
        2,
      );
      await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
      dialog = await canvas.findByRole('dialog', {
        name: 'Disconnect account',
      });
      await expect(dialog).toHaveTextContent('Already disconnected');
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Disconnect account' }),
      );
      await canvas.findByText('Disconnected');
      await waitFor(() =>
        expect(partialDisconnectScenario.disconnect).toHaveBeenCalledTimes(3),
      );
      await expect(
        partialDisconnectScenario.disconnect.mock.calls.filter(
          ([id]) => id === GOOGLE_ACCOUNT_ID,
        ),
      ).toHaveLength(1);
      await expect(
        partialDisconnectScenario.disconnect.mock.calls.filter(
          ([id]) => id === FATHOM_ACCOUNT_ID,
        ),
      ).toHaveLength(2);

      partialDisconnectScenario.reconnect(FATHOM_ACCOUNT_ID);
      await userEvent.click(
        canvas.getByRole('button', { name: 'Refresh connections' }),
      );
      await canvas.findByText('Partially disconnected');
      await openGroupMenu(canvasElement);
      await userEvent.click(
        canvas.getByRole('menuitem', { name: 'Disconnect account' }),
      );
      dialog = await canvas.findByRole('dialog', {
        name: 'Disconnect account',
      });
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Disconnect account' }),
      );
      await canvas.findByText('Disconnected');
      await waitFor(() =>
        expect(partialDisconnectScenario.disconnect).toHaveBeenCalledTimes(4),
      );
      await expect(
        partialDisconnectScenario.disconnect.mock.calls.filter(
          ([id]) => id === FATHOM_ACCOUNT_ID,
        ),
      ).toHaveLength(3);
    },
  };

const partialDeleteScenario = createConsolidatedAccountsScenario({
  deleteFailureId: FATHOM_ACCOUNT_ID,
});
export const PartialDeleteKeepsRemainingRecordAndAvoidsStaleChannelRead: Story =
  {
    parameters: { msw: partialDeleteScenario.mocks },
    beforeEach: partialDeleteScenario.prepare,
    play: async ({ canvasElement }) => {
      const canvas = await openGroupMenu(canvasElement);
      await userEvent.click(
        canvas.getByRole('menuitem', {
          name: 'Delete account and synced data',
        }),
      );
      let dialog = await canvas.findByRole('dialog', {
        name: 'Delete account and synced data?',
      });
      await expect(dialog).toHaveTextContent('native synced emails and events');
      await expect(dialog).toHaveTextContent(
        'Installed apps will remain installed',
      );
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Delete account and data' }),
      );
      await canvas.findByText(
        'Some connections could not be updated. Retry to update the remaining connections.',
      );
      await expect(
        canvas.getByRole('link', { name: /tim@apple.dev/ }),
      ).toBeVisible();
      await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
      dialog = await canvas.findByRole('dialog', {
        name: 'Delete account and synced data?',
      });
      await expect(dialog).not.toHaveTextContent('My Google connection');
      await expect(dialog).toHaveTextContent('My Fathom connection');
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Delete account and data' }),
      );
      await waitFor(() =>
        expect(
          canvas.queryByRole('link', { name: /tim@apple.dev/ }),
        ).not.toBeInTheDocument(),
      );
      await expect(
        partialDeleteScenario.deleteConnection,
      ).toHaveBeenCalledTimes(3);
      await expect(
        partialDeleteScenario.deleteConnection.mock.calls.filter(
          ([id]) => id === GOOGLE_ACCOUNT_ID,
        ),
      ).toHaveLength(1);
      await expect(
        partialDeleteScenario.deleteConnection.mock.calls.filter(
          ([id]) => id === FATHOM_ACCOUNT_ID,
        ),
      ).toHaveLength(2);
      await expect(
        partialDeleteScenario.staleChannelRead,
      ).not.toHaveBeenCalled();
      await expect(canvas.getByText('Blocklist')).toBeVisible();
    },
  };

const sharedScenario = createConsolidatedAccountsScenario({
  accounts: [SHARED_GOOGLE_ACCOUNT, GOOGLE_ACCOUNT, FATHOM_ACCOUNT],
  messageChannels: [
    createConsolidatedMessageChannel(),
    createConsolidatedMessageChannel({
      id: SHARED_MESSAGE_CHANNEL_ID,
      connectedAccountId: SHARED_GOOGLE_ACCOUNT_ID,
      connectedAccount: {
        id: SHARED_GOOGLE_ACCOUNT_ID,
        handle: 'tim@apple.dev',
      },
    }),
  ],
  calendarChannels: [
    createConsolidatedCalendarChannel(),
    createConsolidatedCalendarChannel({
      id: SHARED_CALENDAR_CHANNEL_ID,
      connectedAccountId: SHARED_GOOGLE_ACCOUNT_ID,
    }),
  ],
});
export const SharedConnectionSelectionIsReadOnlyAndHistoryKeepsExactChannel: Story =
  {
    parameters: { msw: sharedScenario.mocks },
    beforeEach: sharedScenario.prepare,
    render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement.ownerDocument.body);
      await canvas.findByText('Personal Inbox');
      await expect(
        canvas.getByText('My Google connection · Personal · You'),
      ).toBeVisible();
      await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
      await waitFor(() =>
        expect(sharedScenario.updateMessageChannel).toHaveBeenCalledWith({
          id: GOOGLE_MESSAGE_CHANNEL_ID,
          update: { visibility: MessageChannelVisibility.METADATA },
        }),
      );
      await waitFor(() =>
        expect(canvas.getByRole('radio', { name: 'Metadata' })).toBeChecked(),
      );
      await userEvent.click(
        canvas.getByText('My Google connection · Personal · You'),
      );
      await userEvent.click(
        within(
          await canvas.findByRole('dialog', { name: 'Connection' }),
        ).getByRole('button', {
          name: 'Team Google connection · Shared · Another member',
        }),
      );
      await canvas.findByText(
        "This shared connection's preferences are managed by its owner.",
      );
      await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
      await expect(canvas.getAllByRole('switch')).toEqual([
        canvas.getByRole('switch', { name: 'Advanced' }),
      ]);
      await expect(
        canvas.queryByText('Personal Inbox'),
      ).not.toBeInTheDocument();
      await expect(canvas.getByLabelText('Current location')).toHaveTextContent(
        `connectedAccountId=${SHARED_GOOGLE_ACCOUNT_ID}`,
      );
      await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
      await canvas.findByText('Personal Inbox');
      await expect(
        canvas.getByRole('radio', { name: 'Metadata' }),
      ).toBeChecked();
      await userEvent.click(canvas.getByRole('button', { name: 'Forward' }));
      await canvas.findByText(
        "This shared connection's preferences are managed by its owner.",
      );
      await expect(sharedScenario.updateMessageChannel).toHaveBeenCalledTimes(
        1,
      );
      await userEvent.click(
        canvas.getByRole('tab', { name: 'Google Calendar' }),
      );
      await canvas.findByText('Event visibility');
      await expect(
        canvas.getByText('My Google connection · Personal · You'),
      ).toBeVisible();
      await userEvent.click(
        canvas.getByText('My Google connection · Personal · You'),
      );
      await userEvent.click(
        within(
          await canvas.findByRole('dialog', { name: 'Connection' }),
        ).getByRole('button', {
          name: 'Team Google connection · Shared · Another member',
        }),
      );
      await canvas.findByText(
        "This shared connection's preferences are managed by its owner.",
      );
      await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
      await expect(
        canvas.getByRole('tab', { name: 'Google Calendar' }),
      ).toHaveAttribute('aria-selected', 'true');
      await expect(canvas.getByLabelText('Current location')).toHaveTextContent(
        `connectedAccountId=${SHARED_GOOGLE_ACCOUNT_ID}#calendar-google`,
      );
      await expect(sharedScenario.updateCalendarChannel).not.toHaveBeenCalled();
    },
  };

const administratorScenario = createConsolidatedAccountsScenario({
  accounts: [SHARED_GOOGLE_ACCOUNT],
  messageChannels: [
    createConsolidatedMessageChannel({
      connectedAccountId: SHARED_GOOGLE_ACCOUNT_ID,
      connectedAccount: {
        id: SHARED_GOOGLE_ACCOUNT_ID,
        handle: 'tim@apple.dev',
      },
    }),
  ],
  calendarChannels: [
    createConsolidatedCalendarChannel({
      connectedAccountId: SHARED_GOOGLE_ACCOUNT_ID,
    }),
  ],
  options: {
    permissionFlags: [
      PermissionFlagType.CONNECTED_ACCOUNTS,
      PermissionFlagType.WORKSPACE,
    ],
  },
});
export const WorkspaceAdministratorCanEditSharedEmailButNotCalendarOrReconnect: Story =
  {
    parameters: { msw: administratorScenario.mocks },
    beforeEach: administratorScenario.prepare,
    render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement.ownerDocument.body);
      await canvas.findByText('Personal Inbox');
      await userEvent.click(canvas.getByRole('radio', { name: 'Metadata' }));
      await waitFor(() =>
        expect(administratorScenario.updateMessageChannel).toHaveBeenCalledWith(
          {
            id: GOOGLE_MESSAGE_CHANNEL_ID,
            update: { visibility: MessageChannelVisibility.METADATA },
          },
        ),
      );
      await waitFor(() =>
        expect(canvas.getByRole('radio', { name: 'Metadata' })).toBeChecked(),
      );
      await userEvent.click(
        canvas.getByRole('tab', { name: 'Google Calendar' }),
      );
      await waitFor(() =>
        expect(
          canvas.getByRole('tab', { name: 'Google Calendar' }),
        ).toHaveAttribute('aria-selected', 'true'),
      );
      await canvas.findByText(
        "This shared connection's preferences are managed by its owner.",
      );
      await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
      await expect(canvas.getAllByRole('switch')).toEqual([
        canvas.getByRole('switch', { name: 'Advanced' }),
      ]);
      await expect(
        canvas.queryByRole('button', { name: 'Reconnect' }),
      ).not.toBeInTheDocument();
      await expect(
        administratorScenario.updateCalendarChannel,
      ).not.toHaveBeenCalled();
    },
  };

export const TabBackForwardIsUrlAuthoritative: Story = {
  render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Personal Inbox');
    await userEvent.click(canvas.getByRole('tab', { name: 'Google Calendar' }));
    await canvas.findByText('Event visibility');
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await canvas.findByText('Personal Inbox');
    await expect(canvas.getByRole('tab', { name: 'Gmail' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      canvas.queryByText('Event visibility'),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Forward' }));
    await canvas.findByText('Event visibility');
    await expect(
      canvas.getByRole('tab', { name: 'Google Calendar' }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const RequestedConnectionFromAnotherAppDoesNotFallback: Story = {
  render: () => (
    <ConsolidatedAccountsFlow
      initialPath={`${ACCOUNT_GROUP_PATH}?connectedAccountId=${FATHOM_ACCOUNT_ID}#email-google`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'The requested connection is unavailable for this app.',
    );
    await expect(canvas.queryByText('Personal Inbox')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await expect(defaultScenario.updateMessageChannel).not.toHaveBeenCalled();
  },
};

export const UnknownAccountDoesNotSelectAnotherEmail: Story = {
  render: () => (
    <ConsolidatedAccountsFlow initialPath="/settings/accounts/detail/email%3Aunknown%40example.com" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'This account does not exist or is not available to you.',
    );
    await expect(canvas.queryByRole('tab')).not.toBeInTheDocument();
    await expect(defaultScenario.readChannels).not.toHaveBeenCalled();
  },
};

const archivedScenario = createConsolidatedAccountsScenario({
  accounts: [
    GOOGLE_ACCOUNT,
    {
      ...FATHOM_ACCOUNT,
      archivedAt: '2026-10-02T00:00:00.000Z',
      visibility: 'workspace',
    },
  ],
});
export const AppReconnectUsesExactConnectionAndOriginalVisibility: Story = {
  parameters: { msw: archivedScenario.mocks },
  beforeEach: archivedScenario.prepare,
  render: () => (
    <ConsolidatedAccountsFlow
      initialPath={`${ACCOUNT_GROUP_PATH}#app-${FATHOM_APPLICATION_ID}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const openWindow = spyOn(window, 'open').mockImplementation(() => null);
    try {
      const reconnect = await canvas.findByRole('button', {
        name: 'Reconnect',
      });
      await waitFor(() => expect(reconnect).toBeEnabled());
      await expect(canvas.getByText('Disconnected')).toBeVisible();
      await userEvent.click(reconnect);
      await waitFor(() => expect(openWindow).toHaveBeenCalled());
      const redirect = openWindow.mock.calls[0][0];
      if (typeof redirect !== 'string') {
        throw new Error('Expected an OAuth URL');
      }
      const url = new URL(redirect);
      await expect(url.pathname).toBe('/auth/apps/authorize');
      await expect(url.searchParams.get('applicationId')).toBe(
        FATHOM_APPLICATION_ID,
      );
      await expect(url.searchParams.get('providerName')).toBe('fathom');
      await expect(url.searchParams.get('visibility')).toBe('workspace');
      await expect(url.searchParams.get('reconnectingConnectedAccountId')).toBe(
        FATHOM_ACCOUNT_ID,
      );
      await expect(url.searchParams.get('redirectLocation')).toBe(
        '/settings/accounts',
      );
    } finally {
      openWindow.mockRestore();
    }
  },
};

const emptyScenario = createConsolidatedAccountsScenario({
  accounts: [],
  messageChannels: [],
  calendarChannels: [],
});
export const NoAccountsKeepsBlocklist: Story = {
  parameters: { msw: emptyScenario.mocks },
  beforeEach: emptyScenario.prepare,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Blocklist');
    await expect(emptyScenario.readChannels).not.toHaveBeenCalled();
    await expect(
      canvas.queryByRole('link', { name: /tim@apple.dev/ }),
    ).not.toBeInTheDocument();
  },
};

const calendarOnlyScenario = createConsolidatedAccountsScenario({
  accounts: [GOOGLE_ACCOUNT],
  messageChannels: [],
});
export const CalendarOnlyKeepsBlocklistAndDoesNotClaimGmail: Story = {
  parameters: { msw: calendarOnlyScenario.mocks },
  beforeEach: calendarOnlyScenario.prepare,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const account = await canvas.findByRole('link', { name: /tim@apple.dev/ });
    await expect(
      await within(account).findByLabelText('Google Calendar'),
    ).toBeVisible();
    await expect(
      within(account).queryByLabelText('Gmail'),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await userEvent.click(account);
    await canvas.findByText('Event visibility');
    await expect(canvas.getAllByRole('tab')).toHaveLength(1);
  },
};

const pausedScenario = createConsolidatedAccountsScenario({
  accounts: [GOOGLE_ACCOUNT],
  messageChannels: [createConsolidatedMessageChannel({ isSyncEnabled: false })],
  calendarChannels: [],
});
export const PausedChannelKeepsItsBindingAndSettings: Story = {
  parameters: { msw: pausedScenario.mocks },
  beforeEach: pausedScenario.prepare,
  render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Syncing is paused for this connection.');
    await expect(canvas.getByRole('tab', { name: 'Gmail' })).toBeVisible();
    await canvas.findByText('Personal Inbox');
  },
};

const pendingScenario = createConsolidatedAccountsScenario({
  accounts: [GOOGLE_ACCOUNT],
  messageChannels: [
    createConsolidatedMessageChannel({
      syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
    }),
  ],
  calendarChannels: [],
});
export const PendingSetupTargetsPhysicalConnection: Story = {
  parameters: { msw: pendingScenario.mocks },
  beforeEach: pendingScenario.prepare,
  render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const completeSetup = await canvas.findByRole('link', {
      name: 'Complete setup',
    });
    await expect(completeSetup).toHaveAttribute(
      'href',
      `/settings/accounts/configuration/${GOOGLE_ACCOUNT_ID}`,
    );
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await userEvent.click(completeSetup);
    await canvas.findByText('Complete connection setup');
  },
};

const orphanScenario = createConsolidatedAccountsScenario({
  accounts: [
    createConsolidatedAccount({ ...FATHOM_ACCOUNT, applicationId: null }),
  ],
  messageChannels: [],
  calendarChannels: [],
});
export const OrphanAppRetainsGenericConnectionManagement: Story = {
  parameters: { msw: orphanScenario.mocks },
  beforeEach: orphanScenario.prepare,
  render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText(
      "This connection's app or provider is unavailable. Its existing connection can still be managed.",
    );
    await expect(canvas.getByRole('tab', { name: 'Connection' })).toBeVisible();
    await expect(orphanScenario.readProviders).not.toHaveBeenCalled();
    await openGroupMenu(canvasElement);
    await expect(
      canvas.getByRole('menuitem', { name: 'Disconnect connection' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

const errorScenario = createConsolidatedAccountsScenario({
  accountsReadFailures: 1,
});
export const AccountReadErrorRetriesWithoutFalseEmptyState: Story = {
  parameters: { msw: errorScenario.mocks },
  beforeEach: errorScenario.prepare,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'Account connections could not be loaded. Some settings may be unavailable.',
    );
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await canvas.findByRole('link', { name: /tim@apple.dev/ });
  },
};

const providerErrorScenario = createConsolidatedAccountsScenario({
  providersReadFailures: 1,
});
export const ProviderReadErrorRetriesWithConnectionVisible: Story = {
  parameters: { msw: providerErrorScenario.mocks },
  beforeEach: providerErrorScenario.prepare,
  render: () => (
    <ConsolidatedAccountsFlow
      initialPath={`${ACCOUNT_GROUP_PATH}#app-${FATHOM_APPLICATION_ID}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('The connection provider could not be loaded.');
    await expect(canvas.getByText('Connected', { exact: true })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await canvas.findByText('Fathom account');
    await expect(providerErrorScenario.readProviders).toHaveBeenCalledTimes(2);
  },
};

const flagOffScenario = createConsolidatedAccountsScenario({
  options: { isConsolidationEnabled: false },
});
export const DisabledFlagPreservesLegacyPageAndRedirectsDetail: Story = {
  parameters: { msw: flagOffScenario.mocks },
  beforeEach: flagOffScenario.prepare,
  render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Connected accounts');
    await expect(canvas.getByText('Blocklist')).toBeVisible();
    await expect(
      canvas.queryByText('Shared accounts between apps'),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('Fathom')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('tab')).not.toBeInTheDocument();
    await expect(canvas.getByLabelText('Current location')).toHaveTextContent(
      '/settings/accounts',
    );
    await expect(flagOffScenario.readProviders).not.toHaveBeenCalled();
  },
};

const noPermissionScenario = createConsolidatedAccountsScenario({
  options: { permissionFlags: [] },
});
export const MissingAccountPermissionRedirectsToProfile: Story = {
  parameters: { msw: noPermissionScenario.mocks },
  beforeEach: noPermissionScenario.prepare,
  render: () => <ConsolidatedAccountsFlow initialPath={ACCOUNT_GROUP_PATH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Profile settings');
    await expect(noPermissionScenario.readChannels).not.toHaveBeenCalled();
    await expect(noPermissionScenario.readProviders).not.toHaveBeenCalled();
  },
};

const resetFailureScenario = createConsolidatedAccountsScenario({
  disconnectFailureId: FATHOM_ACCOUNT_ID,
});
export const NewConfirmationAfterReconnectResetsEarlierPartialFailure: Story = {
  parameters: { msw: resetFailureScenario.mocks },
  beforeEach: resetFailureScenario.prepare,
  play: async ({ canvasElement }) => {
    const canvas = await openGroupMenu(canvasElement);
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'Disconnect account' }),
    );
    let dialog = await canvas.findByRole('dialog', {
      name: 'Disconnect account',
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Disconnect account' }),
    );
    await canvas.findByText(
      'Some connections could not be updated. Retry to update the remaining connections.',
    );
    await canvas.findByText('Partially disconnected');
    resetFailureScenario.reconnect(GOOGLE_ACCOUNT_ID);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Refresh connections' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByText('Partially disconnected'),
      ).not.toBeInTheDocument(),
    );
    await openGroupMenu(canvasElement);
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'Disconnect account' }),
    );
    dialog = await canvas.findByRole('dialog', { name: 'Disconnect account' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Disconnect account' }),
    );
    await canvas.findByText('Disconnected');
    await expect(resetFailureScenario.disconnect).toHaveBeenCalledTimes(4);
    await expect(
      resetFailureScenario.disconnect.mock.calls.filter(
        ([id]) => id === GOOGLE_ACCOUNT_ID,
      ),
    ).toHaveLength(2);
    await expect(
      resetFailureScenario.disconnect.mock.calls.filter(
        ([id]) => id === FATHOM_ACCOUNT_ID,
      ),
    ).toHaveLength(2);
  },
};
