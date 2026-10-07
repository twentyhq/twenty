import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { type AppPreferenceVariable } from '@/settings/app-preferences/types/AppPreferenceVariable';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  FeatureFlagKey,
  type MyAppPreferencesApplicationVariablesQuery,
  type MyAppPreferencesApplicationVariablesQueryVariables,
  type UpdateMyUserApplicationVariableMutation,
  type UpdateMyUserApplicationVariableMutationVariables,
} from '~/generated-metadata/graphql';
import { SettingsAppPreferencesApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesApplication';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const APPLICATION: AppPreferencesApplication = {
  id: '20202020-0000-4000-8000-00000000a001',
  universalIdentifier: '20202020-0000-4000-8000-00000000a002',
  name: 'Stripe',
  logoUrl: null,
  hasConnectionProviders: false,
};

const DISPLAY_PREFERENCE: AppPreferenceVariable = {
  key: 'DISPLAY_PREFERENCES',
  label: 'Display preferences',
  description: 'Show ARR or MRR',
  type: FieldMetadataType.SELECT,
  value: 'MRR',
  options: [
    { label: 'ARR', value: 'ARR' },
    { label: 'MRR', value: 'MRR' },
  ],
  isSecret: false,
  isRequired: false,
  isDeprecated: false,
};

const TYPED_PREFERENCES: AppPreferenceVariable[] = [
  DISPLAY_PREFERENCE,
  {
    ...DISPLAY_PREFERENCE,
    key: 'IS_COMPACT',
    label: 'Compact display',
    description: '',
    type: FieldMetadataType.BOOLEAN,
    value: 'false',
    options: null,
  },
  {
    ...DISPLAY_PREFERENCE,
    key: 'ROW_LIMIT',
    label: 'Row limit',
    description: '',
    type: FieldMetadataType.NUMBER,
    value: '0',
    options: null,
  },
  {
    ...DISPLAY_PREFERENCE,
    key: 'API_KEY',
    label: 'API key',
    description: '',
    type: FieldMetadataType.TEXT,
    value: '********',
    options: null,
    isSecret: true,
  },
  {
    ...DISPLAY_PREFERENCE,
    key: 'GREETING',
    label: 'Greeting',
    description: '',
    type: FieldMetadataType.TEXT,
    value: 'Hello',
    options: null,
  },
];

const savedValues = new Map<string, string>();
const updatePreference = fn();
const readPreferences = fn();

const getPreferenceMocks = ({
  applicationVariables = [DISPLAY_PREFERENCE],
  readError = false,
  failFirstSave = false,
  failFirstRefetch = false,
  applications = [APPLICATION],
}: {
  applicationVariables?: AppPreferenceVariable[];
  readError?: boolean;
  failFirstSave?: boolean;
  failFirstRefetch?: boolean;
  applications?: AppPreferencesApplication[];
} = {}) => ({
  handlers: [
    graphql.query('GetCurrentUser', () =>
      HttpResponse.json({
        data: {
          currentUser: {
            ...mockedUserData,
            currentWorkspace: {
              ...mockCurrentWorkspace,
              featureFlags: [
                { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
              ],
            },
          },
        },
      }),
    ),
    graphql.query('MyAppPreferencesApplications', () =>
      HttpResponse.json({
        data: { myAppPreferencesApplications: applications },
      }),
    ),
    graphql.query<
      MyAppPreferencesApplicationVariablesQuery,
      MyAppPreferencesApplicationVariablesQueryVariables
    >('MyAppPreferencesApplicationVariables', () => {
      readPreferences();

      return readError ||
        (failFirstRefetch && readPreferences.mock.calls.length === 2)
        ? HttpResponse.json({
            errors: [{ message: 'Preference query failed' }],
          })
        : HttpResponse.json({
            data: {
              myAppPreferencesApplicationVariables: applicationVariables.map(
                (variable) => ({
                  ...variable,
                  value: savedValues.get(variable.key) ?? variable.value,
                }),
              ),
            },
          });
    }),
    graphql.mutation<
      UpdateMyUserApplicationVariableMutation,
      UpdateMyUserApplicationVariableMutationVariables
    >('UpdateMyUserApplicationVariable', ({ variables }) => {
      updatePreference(variables);

      if (failFirstSave && updatePreference.mock.calls.length === 1) {
        return HttpResponse.json({
          errors: [{ message: 'Preference save failed' }],
        });
      }

      savedValues.set(variables.key, variables.value);

      return HttpResponse.json({
        data: { updateMyUserApplicationVariable: true },
      });
    }),
    ...graphqlMocks.handlers,
  ],
});

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferencesApplication',
  component: SettingsAppPreferencesApplication,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/apps/:applicationId',
    routeParams: { ':applicationId': APPLICATION.id },
  },
  parameters: { layout: 'fullscreen', msw: getPreferenceMocks() },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    savedValues.clear();
    updatePreference.mockClear();
    readPreferences.mockClear();
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
      ],
    });

    return () =>
      jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAppPreferencesApplication>;

export const StripeDisplayPreferences: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Show ARR or MRR')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Display preferences' }),
    ).toHaveTextContent('MRR');
    await expect(canvas.queryByText('Accounts')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument();
  },
};

export const SaveSelectPreference: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Display preferences' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'ARR' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('button', { name: 'Display preferences' }),
    ).toHaveTextContent('ARR');
    await expect(updatePreference).toHaveBeenCalledWith({
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
      key: DISPLAY_PREFERENCE.key,
      value: 'ARR',
    });
  },
};

export const CancelSelectPreference: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Display preferences' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'ARR' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(
      canvas.getByRole('button', { name: 'Display preferences' }),
    ).toHaveTextContent('MRR');
    await expect(updatePreference).not.toHaveBeenCalled();
  },
};

export const PreserveTypedDefaultsAndSecret: Story = {
  parameters: {
    msw: getPreferenceMocks({ applicationVariables: TYPED_PREFERENCES }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      await canvas.findByRole('button', { name: 'Compact display' }),
    ).toHaveTextContent('False');
    await expect(
      canvas.getByRole('textbox', { name: 'Row limit' }),
    ).toHaveValue('0');
    await expect(
      canvas.getByLabelText('API key', { selector: 'input' }),
    ).toHaveValue('********');
    await expect(canvas.getByRole('textbox', { name: 'Greeting' })).toHaveValue(
      'Hello',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Display preferences' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'ARR' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updatePreference).toHaveBeenCalledTimes(1));
    await expect(updatePreference).toHaveBeenCalledWith({
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
      key: DISPLAY_PREFERENCE.key,
      value: 'ARR',
    });
  },
};

export const InvalidNumber: Story = {
  parameters: {
    msw: getPreferenceMocks({ applicationVariables: TYPED_PREFERENCES }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const numberInput = await canvas.findByRole('textbox', {
      name: 'Row limit',
    });

    await userEvent.clear(numberInput);
    await userEvent.type(numberInput, 'invalid');
    await expect(canvas.getByText('Enter a valid number.')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
    await expect(updatePreference).not.toHaveBeenCalled();
  },
};

export const ClearOptionalPreference: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Display preferences' }),
    );
    await userEvent.click(
      await body.findByRole('button', { name: 'No value' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('button', { name: 'Display preferences' }),
    ).toHaveTextContent('No value');
    await expect(updatePreference).toHaveBeenCalledWith({
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
      key: DISPLAY_PREFERENCE.key,
      value: '',
    });
  },
};

export const RetryFailedSave: Story = {
  parameters: { msw: getPreferenceMocks({ failFirstSave: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Display preferences' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'ARR' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByText(
        'Some preferences could not be saved. Try again.',
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Display preferences' }),
    ).toHaveTextContent('ARR');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument(),
    );
    await expect(updatePreference).toHaveBeenCalledTimes(2);
  },
};

export const RetryPartiallySavedPreferences: Story = {
  parameters: {
    msw: getPreferenceMocks({
      applicationVariables: TYPED_PREFERENCES,
      failFirstSave: true,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Display preferences' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'ARR' }));
    const numberInput = canvas.getByRole('textbox', { name: 'Row limit' });

    await userEvent.clear(numberInput);
    await userEvent.type(numberInput, '5');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByText(
        'Some preferences could not be saved. Try again.',
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Display preferences' }),
    ).toHaveTextContent('ARR');
    await expect(
      canvas.getByRole('textbox', { name: 'Row limit' }),
    ).toHaveValue('5');
    await expect(updatePreference).toHaveBeenCalledTimes(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument(),
    );
    await expect(updatePreference).toHaveBeenCalledTimes(3);
    await expect(updatePreference).toHaveBeenLastCalledWith({
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
      key: DISPLAY_PREFERENCE.key,
      value: 'ARR',
    });
  },
};

export const RetryFailedRefetch: Story = {
  parameters: { msw: getPreferenceMocks({ failFirstRefetch: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Display preferences' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'ARR' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByText('Unable to save preferences. Try again.'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Display preferences' }),
    ).toHaveTextContent('ARR');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const ReadError: Story = {
  parameters: { msw: getPreferenceMocks({ readError: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Unable to load app preferences.'),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();
  },
};

export const Empty: Story = {
  parameters: { msw: getPreferenceMocks({ applicationVariables: [] }) },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'This app has no personal preferences to configure.',
      ),
    ).toBeVisible();
  },
};

export const UnavailableApplication: Story = {
  parameters: { msw: getPreferenceMocks({ applications: [] }) },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'This app is no longer available in your workspace.',
      ),
    ).toBeVisible();
  },
};
