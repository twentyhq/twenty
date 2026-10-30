import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { ErrorMessageEffect } from '@/error-handler/components/ErrorMessageEffect';
import { myApplicationHealthCheckFamilyState } from '@/settings/app-preferences/states/myApplicationHealthCheckFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Toaster } from 'twenty-ui/components/feedback';
import { ApplicationHealthStatus } from '~/generated-metadata/graphql';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import {
  FATHOM_APPLICATION_ID,
  GRANOLA_APPLICATION_ID,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS,
  GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID,
  failNextApplicationPreferencesRequest,
  stopApplicationForNextRequest,
  findApplicationsGatedQuery,
  findOneFrontComponent,
  seedApplicationPreferencesStory,
  updateMyUserApplicationVariable,
} from '~/pages/settings/accounts/__stories__/mockedApplicationPreferences';
import {
  declareUserHealthCheck,
  failNextUserHealthCheckRequest,
  runMyApplicationHealthCheck,
} from '~/pages/settings/accounts/__stories__/mockedUserHealthCheck';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsApplicationPreferences',
  component: SettingsApplicationPreferences,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/:applicationId',
    routeParams: { ':applicationId': FATHOM_APPLICATION_ID },
    additionalRoutes: ['/settings/app-preferences'],
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
  args: { routeHash: '#variables' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: 'Variables' }, { timeout: 3000 }),
    ).toBeVisible();
    expect(canvas.getAllByText('Fathom').length).toBeGreaterThan(0);
    expect(canvas.getByText('Apps preferences')).toBeVisible();
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
  args: { routeHash: '#variables' },
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

export const RequiredValueGatesHealthChecksAfterSave: Story = {
  args: { routeHash: '#variables' },
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    declareUserHealthCheck({
      applicationId: FATHOM_APPLICATION_ID,
      result: {
        status: 'WARNING',
        title: 'Your Fathom plan does not include recordings',
        description: null,
        action: null,
      },
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Missing configuration: Meeting language',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(runMyApplicationHealthCheck).not.toHaveBeenCalled();

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
    expect(
      await canvas.findByText('Your Fathom plan does not include recordings'),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('link', { name: 'General' }));

    expect(
      await canvas.findByText(
        'Records, transcribes and summarizes your meetings.',
      ),
    ).toBeVisible();
    expect(
      canvas.getByText('Your Fathom plan does not include recordings'),
    ).toBeVisible();
    expect(runMyApplicationHealthCheck.mock.calls).toEqual([
      [{ applicationId: FATHOM_APPLICATION_ID }],
    ]);

    await userEvent.click(canvas.getByRole('link', { name: 'Variables' }));
    await userEvent.clear(await canvas.findByDisplayValue('fr'));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save settings' }),
    );

    expect(
      await canvas.findByText('Missing configuration: Meeting language'),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Save settings' }),
      ).toBeDisabled(),
    );
    expect(runMyApplicationHealthCheck).toHaveBeenCalledTimes(1);
  },
};

export const UserHealthCheckShowsItsBannerOnOpen: Story = {
  args: {
    routeParams: { ':applicationId': GRANOLA_APPLICATION_ID },
  },
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    declareUserHealthCheck({
      applicationId: GRANOLA_APPLICATION_ID,
      result: {
        status: 'ERROR',
        title: 'Your Granola key was revoked',
        description: 'Add a new key to keep importing your notes.',
        action: { label: 'Fix it', location: null },
      },
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Your Granola key was revoked', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(
      canvas.getByText('Add a new key to keep importing your notes.'),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Fix it' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('link', { name: 'My notes' }));

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Fix it' }),
    );

    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Fix it' }),
      ).not.toBeInTheDocument(),
    );
    expect(canvas.getByText('Your Granola key was revoked')).toBeVisible();
    expect(runMyApplicationHealthCheck.mock.calls).toEqual([
      [{ applicationId: GRANOLA_APPLICATION_ID }],
    ]);
  },
};

export const FailedUserHealthCheckRetainsItsBanner: Story = {
  ...RequiredValueGatesHealthChecksAfterSave,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster getToastProps={() => ({ progress: 100 })} />
      </>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('Missing configuration: Meeting language');
    const meetingLanguageRow = canvas
      .getByText('Meeting language')
      .closest<HTMLElement>('div:has(input)');

    if (!isDefined(meetingLanguageRow)) {
      throw new Error('Missing the Meeting language row');
    }

    await userEvent.type(within(meetingLanguageRow).getByRole('textbox'), 'fr');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save settings' }),
    );

    expect(
      await canvas.findByText('Your Fathom plan does not include recordings'),
    ).toBeVisible();
    failNextUserHealthCheckRequest();

    const recordMyMeetingsInput = canvas.getByDisplayValue('always');

    await userEvent.clear(recordMyMeetingsInput);
    await userEvent.type(recordMyMeetingsInput, 'never');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save settings' }),
    );

    expect(
      await body.findByText("Failed to check the app's health."),
    ).toBeVisible();
    expect(
      canvas.getByText('Your Fathom plan does not include recordings'),
    ).toBeVisible();
    expect(runMyApplicationHealthCheck).toHaveBeenCalledTimes(2);
  },
};

export const AppWithoutUserHealthCheckNeverRunsIt: Story = {
  args: {
    routeParams: { ':applicationId': GRANOLA_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: 'My notes' }, { timeout: 3000 }),
    ).toBeVisible();
    expect(runMyApplicationHealthCheck).not.toHaveBeenCalled();
  },
};

export const UnreadableUserHealthCheckClearsTheBannerAfterSave: Story = {
  args: { routeHash: '#variables' },
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    declareUserHealthCheck({
      applicationId: FATHOM_APPLICATION_ID,
      result: {
        status: 'ERROR',
        title: 'Your Fathom key was revoked',
        description: null,
        action: null,
      },
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Missing configuration: Meeting language',
      undefined,
      { timeout: 3000 },
    );

    const meetingLanguageRow = canvas
      .getByText('Meeting language')
      .closest<HTMLElement>('div:has(input)');

    if (!isDefined(meetingLanguageRow)) {
      throw new Error('Missing the Meeting language row');
    }

    const saveButton = canvas.getByRole('button', { name: 'Save settings' });

    await userEvent.type(within(meetingLanguageRow).getByRole('textbox'), 'fr');
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    expect(
      await canvas.findByText('Your Fathom key was revoked', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();

    declareUserHealthCheck({
      applicationId: FATHOM_APPLICATION_ID,
      result: {
        status: 'UNKNOWN',
        title: null,
        description: null,
        action: null,
      },
    });

    const recordMyMeetingsInput = canvas.getByDisplayValue('always');

    await userEvent.clear(recordMyMeetingsInput);
    await userEvent.type(recordMyMeetingsInput, 'never');
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(
        canvas.queryByText('Your Fathom key was revoked'),
      ).not.toBeInTheDocument(),
    );
    expect(runMyApplicationHealthCheck).toHaveBeenCalledTimes(2);
  },
};

export const PreviousVisitResultIsClearedOnOpen: Story = {
  args: {
    routeParams: { ':applicationId': GRANOLA_APPLICATION_ID },
  },
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    declareUserHealthCheck({
      applicationId: GRANOLA_APPLICATION_ID,
      result: { status: 'OK', title: null, description: null, action: null },
    });
    failNextUserHealthCheckRequest();
    jotaiStore.set(
      myApplicationHealthCheckFamilyState.atomFamily(GRANOLA_APPLICATION_ID),
      {
        runId: 'previous-visit',
        result: {
          __typename: 'ApplicationHealthCheckResult',
          status: ApplicationHealthStatus.ERROR,
          title: 'Result from the previous visit',
          description: null,
          action: null,
        },
      },
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () =>
        expect(runMyApplicationHealthCheck.mock.calls).toEqual([
          [{ applicationId: GRANOLA_APPLICATION_ID }],
        ]),
      { timeout: 3000 },
    );
    expect(await canvas.findByRole('link', { name: 'My notes' })).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.queryByText('Result from the previous visit'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const SavedSecretIsReplacedNotAppended: Story = {
  args: { routeHash: '#variables' },
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
  args: { routeHash: '#variables' },
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

export const SettingsOnlyAppOpensItsSettingsFromTheTabBar: Story = {
  args: {
    routeParams: { ':applicationId': GRANOLA_APPLICATION_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const myNotesLink = await canvas.findByRole(
      'link',
      { name: 'My notes' },
      { timeout: 3000 },
    );

    expect(canvas.getByRole('link', { name: 'General' })).toBeVisible();

    await userEvent.click(myNotesLink);

    await waitFor(
      () =>
        expect(findOneFrontComponent).toHaveBeenCalledWith(
          GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID,
        ),
      { timeout: 3000 },
    );
    expect(
      canvas.queryByRole('link', { name: 'Variables' }),
    ).not.toBeInTheDocument();
    expect(canvas.queryByText('Language')).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Save settings' }),
    ).not.toBeInTheDocument();
    expect(findApplicationsGatedQuery).not.toHaveBeenCalled();
  },
};

export const MemberLandsOnGeneralWithoutWorkspaceActions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Records, transcribes and summarizes your meetings.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      await canvas.findByText('Connect with Fathom', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(canvas.queryByText('Record my meetings')).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Save settings' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: /Uninstall/ }),
    ).not.toBeInTheDocument();
    expect(canvas.queryByText('View in marketplace')).not.toBeInTheDocument();
    expect(canvas.queryByText('See app page')).not.toBeInTheDocument();
    expect(findApplicationsGatedQuery).not.toHaveBeenCalled();
  },
};

export const StoppedAppShowsDegradedBanner: Story = {
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    stopApplicationForNextRequest();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        /We are currently encountering issues with this app/,
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
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
    routeHash: '#general',
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
        /^#general$/,
      ),
    );
    expect(
      await canvas.findByText(
        'Connect your own Fathom account for this app to use on your behalf.',
      ),
    ).toBeVisible();
    expect(canvas.queryByText('Record my meetings')).not.toBeInTheDocument();
    expect(canvas.getByRole('link', { name: 'Variables' })).toBeVisible();
    expect(canvas.getByRole('link', { name: 'General' })).toBeVisible();
  },
};

export const UnknownAppGoesBackToAppPreferences: Story = {
  args: {
    routeParams: { ':applicationId': '20202020-1a2b-4c3d-8e4f-000000000099' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Navigated to /settings/app-preferences',
        undefined,
        {
          timeout: 3000,
        },
      ),
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
