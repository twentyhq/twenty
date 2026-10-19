import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import {
  FATHOM_APPLICATION_ID,
  GRANOLA_APPLICATION_ID,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
  GRANOLA_USER_SETTINGS_FRONT_COMPONENT_ID,
  findApplicationsGatedQuery,
  findOneFrontComponent,
  seedApplicationPreferencesStory,
  updateMyUserApplicationVariable,
} from '~/pages/settings/accounts/__stories__/mockedApplicationPreferences';

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
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
};

export default meta;

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

    await userEvent.type(personalApiKeyInput, 'sk-new-key');

    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitFor(() =>
      expect(updateMyUserApplicationVariable.mock.calls).toEqual([
        [
          {
            applicationUniversalIdentifier: FATHOM_APPLICATION_ID,
            key: 'PERSONAL_API_KEY',
            value: 'sk-new-key',
          },
        ],
      ]),
    );
    await waitFor(() =>
      expect(canvas.getByPlaceholderText('sk-1********')).toHaveValue(''),
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
    expect(
      canvas.queryByPlaceholderText('sk-1********'),
    ).not.toBeInTheDocument();
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
