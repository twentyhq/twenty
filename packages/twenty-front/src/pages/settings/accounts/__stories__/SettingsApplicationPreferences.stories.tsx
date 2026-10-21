import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { useLocation } from 'react-router-dom';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';
import { Toaster } from 'twenty-ui/components/feedback';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import {
  FATHOM_APPLICATION_ID,
  GRANOLA_APPLICATION_ID,
  deleteConnectedAccount,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS,
  APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
  GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID,
  failNextApplicationPreferencesRequest,
  findApplicationsGatedQuery,
  findOneFrontComponent,
  seedApplicationPreferencesStory,
  updateMyUserApplicationVariable,
} from '~/pages/settings/accounts/__stories__/mockedApplicationPreferences';
import {
  LINEAR_APPLICATION_ID,
  LINEAR_CONNECTIONS_REDIRECT_LOCATION,
  LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
  LINEAR_LEGACY_PERSONAL_ACCOUNT_ID,
  MOCKED_TRANSIENT_TOKEN,
  generateTransientToken,
  removeLegacyLinearPersonalConnection,
  unconfigureLinearClientCredentials,
} from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';
import { clickAndCaptureOAuthRedirect } from '~/pages/settings/accounts/__stories__/clickAndCaptureOAuthRedirect';
import { withinTableRowOrThrow } from '~/pages/settings/accounts/__stories__/withinTableRowOrThrow';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsApplicationPreferences',
  component: SettingsApplicationPreferences,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/applications/:applicationId',
    routeParams: { ':applicationId': FATHOM_APPLICATION_ID },
    additionalRoutes: ['/settings/accounts'],
  },
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS },
  },
};

export default meta;

const NEW_PERSONAL_API_KEY = 'sk-2abcdefghijklmnopqrstuvwxyz0123456789';

export type Story = StoryObj<typeof SettingsApplicationPreferences>;

export const VariablesTabSavesOnlyEditedValues: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: 'Variables' }, { timeout: 3000 }),
    ).toBeVisible();
    expect(canvas.getAllByText('Fathom').length).toBeGreaterThan(0);
    expect(canvas.getByText('App preferences')).toBeVisible();
    expect(canvas.getByText('Record my meetings')).toBeVisible();
    expect(canvas.getByDisplayValue('always')).toBeVisible();
    expect(canvas.getByPlaceholderText('sk-1********')).toHaveValue('');
    expect(canvas.queryByText('Old flag')).not.toBeInTheDocument();

    const saveButton = canvas.getByRole('button', { name: 'Save settings' });

    expect(saveButton).toBeDisabled();

    const recordMyMeetingsInput = canvas.getByDisplayValue('always');

    await userEvent.clear(recordMyMeetingsInput);
    await userEvent.type(recordMyMeetingsInput, 'never');

    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(updateMyUserApplicationVariable.mock.calls).toEqual([
        [
          {
            applicationUniversalIdentifier: FATHOM_APPLICATION_ID,
            key: 'RECORD_MY_MEETINGS',
            value: 'never',
          },
        ],
      ]),
    );
    await waitFor(() => expect(saveButton).toBeDisabled());
    expect(canvas.getByDisplayValue('never')).toBeVisible();
    expect(canvas.getByPlaceholderText('sk-1********')).toHaveValue('');
    expect(findApplicationsGatedQuery).not.toHaveBeenCalled();
  },
};

export const ClearedValueFallsBackToTheDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const recordMyMeetingsInput = await canvas.findByDisplayValue(
      'always',
      undefined,
      { timeout: 3000 },
    );
    const saveButton = canvas.getByRole('button', { name: 'Save settings' });

    await userEvent.clear(recordMyMeetingsInput);

    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(updateMyUserApplicationVariable.mock.calls).toEqual([
        [
          {
            applicationUniversalIdentifier: FATHOM_APPLICATION_ID,
            key: 'RECORD_MY_MEETINGS',
            value: '',
          },
        ],
      ]),
    );
    await waitFor(() => expect(recordMyMeetingsInput).toHaveValue('always'), {
      timeout: 3000,
    });
    expect(saveButton).toBeDisabled();
  },
};

export const MissingRequiredValueShowsBannerUntilSaved: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Missing configuration: Meeting language',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();

    const meetingLanguageRow = canvas
      .getByText('Meeting language')
      .closest<HTMLElement>('div:has(input)');

    if (!isDefined(meetingLanguageRow)) {
      throw new Error('Missing the Meeting language row');
    }

    await userEvent.type(within(meetingLanguageRow).getByRole('textbox'), 'fr');

    const saveButton = canvas.getByRole('button', { name: 'Save settings' });

    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(
        canvas.queryByText('Missing configuration: Meeting language'),
      ).not.toBeInTheDocument(),
    );
    expect(updateMyUserApplicationVariable.mock.calls).toEqual([
      [
        {
          applicationUniversalIdentifier: FATHOM_APPLICATION_ID,
          key: 'MEETING_LANGUAGE',
          value: 'fr',
        },
      ],
    ]);
  },
};

export const SavedSecretIsReplacedNotAppended: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const personalApiKeyInput = await canvas.findByPlaceholderText(
      'sk-1********',
      undefined,
      { timeout: 3000 },
    );

    expect(personalApiKeyInput).toHaveValue('');
    expect(personalApiKeyInput).toHaveAttribute('type', 'password');

    const saveButton = canvas.getByRole('button', { name: 'Save settings' });

    await userEvent.type(personalApiKeyInput, 'x');
    await userEvent.clear(personalApiKeyInput);

    expect(saveButton).toBeDisabled();

    await userEvent.type(personalApiKeyInput, NEW_PERSONAL_API_KEY);

    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(updateMyUserApplicationVariable.mock.calls).toEqual([
        [
          {
            applicationUniversalIdentifier: FATHOM_APPLICATION_ID,
            key: 'PERSONAL_API_KEY',
            value: NEW_PERSONAL_API_KEY,
          },
        ],
      ]),
    );
    await waitFor(() =>
      expect(canvas.getByPlaceholderText('sk-2********')).toHaveValue(''),
    );
  },
};

export const SavedSecretCanBeCleared: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const personalApiKeyInput = await canvas.findByPlaceholderText(
      'sk-1********',
      undefined,
      { timeout: 3000 },
    );
    const saveButton = canvas.getByRole('button', { name: 'Save settings' });

    expect(saveButton).toBeDisabled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear stored value' }),
    );

    expect(personalApiKeyInput).toHaveValue('');
    expect(personalApiKeyInput).toHaveAttribute('placeholder', 'Value');
    expect(
      canvas.queryByRole('button', { name: 'Clear stored value' }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(saveButton).toBeEnabled());

    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(updateMyUserApplicationVariable.mock.calls).toEqual([
        [
          {
            applicationUniversalIdentifier: FATHOM_APPLICATION_ID,
            key: 'PERSONAL_API_KEY',
            value: '',
          },
        ],
      ]),
    );
    await waitFor(() => expect(saveButton).toBeDisabled());
    await waitFor(() =>
      expect(
        canvas.queryByPlaceholderText('sk-1********'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const SettingsTabReplacesVariablesTab: Story = {
  args: {
    routeParams: { ':applicationId': GRANOLA_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: 'My notes' }, { timeout: 3000 }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: 'Variables' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Save settings' }),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(findOneFrontComponent).toHaveBeenCalledWith(
        GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID,
      ),
    );
    expect(findApplicationsGatedQuery).not.toHaveBeenCalled();
  },
};

export const ConnectionOnlyAppListsMyConnections: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole(
        'link',
        { name: 'Connections' },
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: 'Variables' }),
    ).not.toBeInTheDocument();

    expect(await canvas.findByText('Work Linear')).toBeVisible();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Work Linear' }).getByText(
        'Connected',
      ),
    ).toBeVisible();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Work Linear' }).queryByRole(
        'button',
        {
          name: 'Reconnect',
        },
      ),
    ).not.toBeInTheDocument();

    const reconnectNeededRow = withinTableRowOrThrow({
      canvasElement,
      text: 'tim.cook@linear.app',
    });

    expect(reconnectNeededRow.getByText('Reconnect needed')).toBeVisible();
    expect(
      reconnectNeededRow.getByRole('button', { name: 'Reconnect' }),
    ).toBeVisible();

    const archivedRow = withinTableRowOrThrow({
      canvasElement,
      text: 'old@linear.app',
    });

    expect(archivedRow.getByText('Reconnect needed')).toBeVisible();
    expect(
      archivedRow.getByRole('button', { name: 'Reconnect' }),
    ).toBeVisible();

    expect(canvas.queryByText('shared@linear.app')).not.toBeInTheDocument();
    expect(canvas.queryByText('teammate@linear.app')).not.toBeInTheDocument();
    expect(findApplicationsGatedQuery).not.toHaveBeenCalled();
  },
};

export const AddConnectionStartsTheOAuthFlow: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await canvas.findByRole(
        'button',
        { name: 'Add connection' },
        { timeout: 3000 },
      ),
    );

    expect(generateTransientToken).toHaveBeenCalledTimes(1);
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/apps/authorize`,
    );
    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: LINEAR_APPLICATION_ID,
      providerName: 'linear',
      transientToken: MOCKED_TRANSIENT_TOKEN,
      scope: 'USER',
      visibility: 'user',
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
  },
};

export const ReconnectStartsTheOAuthFlow: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim.cook@linear.app', undefined, {
      timeout: 3000,
    });

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim.cook@linear.app',
      }).getByRole('button', { name: 'Reconnect' }),
    );

    expect(generateTransientToken).toHaveBeenCalledTimes(1);
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/apps/authorize`,
    );
    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: LINEAR_APPLICATION_ID,
      providerName: 'linear',
      transientToken: MOCKED_TRANSIENT_TOKEN,
      scope: 'USER',
      visibility: 'user',
      reconnectingConnectedAccountId: LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
  },
};

export const RowDisconnectRemovesTheConnection: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('tim.cook@linear.app', undefined, {
      timeout: 3000,
    });

    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim.cook@linear.app',
      }).getByRole('button', { name: 'Disconnect' }),
    );
    await userEvent.click(
      await within(
        await body.findByRole('dialog', { name: 'Disconnect connection?' }),
      ).findByRole('button', { name: 'Disconnect' }),
    );

    await waitFor(() =>
      expect(deleteConnectedAccount.mock.calls).toEqual([
        [LINEAR_RECONNECT_NEEDED_ACCOUNT_ID],
      ]),
    );
    await waitFor(() =>
      expect(canvas.queryByText('tim.cook@linear.app')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Disconnect connection?' }),
      ).not.toBeInTheDocument(),
    );
    expect(canvas.getByText('Work Linear')).toBeVisible();
  },
};

export const UnconfiguredProviderExplainsWhoMustSetItUp: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    unconfigureLinearClientCredentials();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Linear OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add a connection.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Add connection' }),
    ).not.toBeInTheDocument();
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim.cook@linear.app',
      }).queryByRole('button', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();

    expect(
      canvas.getByText(/Linear workspace OAuth is not yet set up/),
    ).toBeVisible();

    const legacyRow = withinTableRowOrThrow({
      canvasElement,
      text: 'legacy@linear.app',
    });

    expect(legacyRow.getByRole('button', { name: 'Disconnect' })).toBeVisible();
    expect(
      legacyRow.queryByRole('button', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
  },
};

export const WorkspaceProviderListsMyLegacyConnection: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'New connections for this app are shared with the workspace by an admin.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(canvas.getByText('Linear workspace')).toBeVisible();
    expect(
      canvas.getAllByRole('button', { name: 'Add connection' }),
    ).toHaveLength(1);

    const legacyRow = withinTableRowOrThrow({
      canvasElement,
      text: 'legacy@linear.app',
    });

    expect(legacyRow.getByText('Reconnect needed')).toBeVisible();
    expect(legacyRow.getByRole('button', { name: 'Disconnect' })).toBeVisible();
    expect(
      canvas.queryByText('workspace-shared@linear.app'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByText(/Linear workspace OAuth is not yet set up/),
    ).not.toBeInTheDocument();

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      legacyRow.getByRole('button', { name: 'Reconnect' }),
    );

    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/apps/authorize`,
    );
    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: LINEAR_APPLICATION_ID,
      providerName: 'linear-workspace',
      transientToken: MOCKED_TRANSIENT_TOKEN,
      scope: 'USER',
      visibility: 'user',
      reconnectingConnectedAccountId: LINEAR_LEGACY_PERSONAL_ACCOUNT_ID,
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
  },
};

export const WorkspaceProviderWithoutPersonalConnectionIsHidden: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    removeLegacyLinearPersonalConnection();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('tim.cook@linear.app', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(canvas.queryByText('Linear workspace')).not.toBeInTheDocument();
    expect(
      canvas.queryByText(
        'New connections for this app are shared with the workspace by an admin.',
      ),
    ).not.toBeInTheDocument();
  },
};

export const ProviderWithoutConnectionsSaysSo: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('You have no Linear connection yet.', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'Add connection' }),
    ).toBeVisible();
  },
};

export const UnconfiguredProviderWithoutConnectionsShowsOnlyTheBanner: Story = {
  args: {
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
  },
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    unconfigureLinearClientCredentials();
  },
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(/Linear OAuth is not yet set up/, undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(
      canvas.queryByText('You have no Linear connection yet.'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByText(/Linear workspace OAuth is not yet set up/),
    ).not.toBeInTheDocument();
  },
};

const FAILED_OAUTH_ERROR_MESSAGE =
  'Failed to exchange the authorization code for an access token.';

const LocationProbe = () => {
  const { search, hash } = useLocation();

  return <div data-testid="location-probe">{`${search}${hash}`}</div>;
};

export const FailedOAuthReturnShowsItsMessage: Story = {
  args: {
    routeParams: { ':applicationId': FATHOM_APPLICATION_ID },
    searchParams: { errorMessage: FAILED_OAUTH_ERROR_MESSAGE },
    routeHash: '#connections',
  },
  decorators: [
    (Story) => (
      <>
        <ErrorMessageEffect />
        <LocationProbe />
        <Story />
        <Toaster getToastProps={() => ({ progress: 100 })} />
      </>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await body.findByText(FAILED_OAUTH_ERROR_MESSAGE, undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    await waitFor(() =>
      expect(canvas.getByTestId('location-probe')).toHaveTextContent(
        /^#connections$/,
      ),
    );
    expect(
      await canvas.findByText(
        'Connect your own Fathom account for this app to use on your behalf.',
      ),
    ).toBeVisible();
    expect(canvas.queryByText('Record my meetings')).not.toBeInTheDocument();
    expect(canvas.getByRole('link', { name: 'Variables' })).toBeVisible();
  },
};

export const UnknownAppGoesBackToAccounts: Story = {
  args: {
    routeParams: { ':applicationId': '20202020-1a2b-4c3d-8e4f-000000000099' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Navigated to /settings/accounts', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
  },
};

export const LoadErrorOffersRetryInsteadOfGoingBack: Story = {
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    failNextApplicationPreferencesRequest();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'This application could not be loaded. Check your connection and try again.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(canvas.queryByText(/Navigated to/)).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));

    expect(
      await canvas.findByRole('link', { name: 'Variables' }, { timeout: 3000 }),
    ).toBeVisible();
    expect(
      canvas.queryByText(
        'This application could not be loaded. Check your connection and try again.',
      ),
    ).not.toBeInTheDocument();
    expect(canvas.queryByText(/Navigated to/)).not.toBeInTheDocument();
  },
};

export const FlagOffGoesBackToAccounts: Story = {
  beforeEach: async () => {
    await seedApplicationPreferencesStory();

    const currentWorkspace = jotaiStore.get(currentWorkspaceState.atom);

    if (isDefined(currentWorkspace)) {
      jotaiStore.set(currentWorkspaceState.atom, {
        ...currentWorkspace,
        featureFlags: [],
      });
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Navigated to /settings/accounts', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
  },
};
