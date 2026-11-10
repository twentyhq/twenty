import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsApplicationApiKeyConnectionDialog } from '@/settings/applications/components/SettingsApplicationApiKeyConnectionDialog';
import { getApplicationApiKeyConnectionDialogId } from '@/settings/applications/utils/getApplicationApiKeyConnectionDialogId';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type ConnectApplicationWithApiKeyMutation,
  type ConnectApplicationWithApiKeyMutationVariables,
} from '~/generated-metadata/graphql';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const APPLICATION_ID = '20202020-6a7b-4c3d-8e4f-000000000002';
const CONNECTED_ACCOUNT_ID = '20202020-6a7b-4c3d-8e4f-000000000003';
const VALID_API_KEY = 'acme-valid-key';
const CONNECTION_PROVIDER = {
  name: 'acme',
  displayName: 'Acme',
  type: 'apiKey',
};

const connectRequest = fn();

const OpenDialogDecorator: Decorator = (Story) => {
  const dialogId = getApplicationApiKeyConnectionDialogId({
    applicationId: APPLICATION_ID,
    providerName: CONNECTION_PROVIDER.name,
  });

  jotaiStore.set(
    isDialogOpenedComponentState.atomFamily({ instanceId: dialogId }),
    true,
  );
  jotaiStore.set(focusStackState.atom, [
    {
      focusId: dialogId,
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: dialogId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);

  return <Story />;
};

const meta: Meta<typeof SettingsApplicationApiKeyConnectionDialog> = {
  title:
    'Modules/Settings/Applications/SettingsApplicationApiKeyConnectionDialog',
  component: SettingsApplicationApiKeyConnectionDialog,
  decorators: [OpenDialogDecorator, RootDecorator, ComponentDecorator],
  args: {
    applicationId: APPLICATION_ID,
    connectionProvider: CONNECTION_PROVIDER,
  },
  beforeEach: async () => {
    connectRequest.mockClear();
    await mockedApolloClient.clearStore();
  },
  parameters: {
    disableHotkeyInitialization: true,
    msw: {
      handlers: [
        graphql.mutation<
          ConnectApplicationWithApiKeyMutation,
          ConnectApplicationWithApiKeyMutationVariables
        >('ConnectApplicationWithApiKey', ({ variables }) => {
          connectRequest(variables);

          if (variables.input.apiKey !== VALID_API_KEY) {
            return HttpResponse.json({
              errors: [
                {
                  message:
                    'identifyAccount logic function of connection provider failed: 401 Unauthorized',
                  extensions: {
                    code: 'BAD_USER_INPUT',
                    userFriendlyMessage:
                      'The Acme API key was rejected. Check it and try again.',
                  },
                },
              ],
            });
          }

          return HttpResponse.json({
            data: { connectApplicationWithApiKey: CONNECTED_ACCOUNT_ID },
          });
        }),
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({ data: { myConnectedAccounts: [] } }),
        ),
        graphql.query('ApplicationConnectedAccounts', () =>
          HttpResponse.json({ data: { applicationConnectedAccounts: [] } }),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const findDialog = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole('dialog', {
    name: 'Connect Acme',
  });

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement);
    const input = within(dialog).getByLabelText('Acme API key');

    expect(input).toHaveAttribute('type', 'password');
    expect(
      within(dialog).getByRole('button', { name: 'Connect' }),
    ).toBeDisabled();
  },
};

export const RejectedKey: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement);

    await userEvent.type(
      within(dialog).getByLabelText('Acme API key'),
      'wrong-key',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Connect' }),
    );

    expect(
      await within(dialog).findByText(
        'The Acme API key was rejected. Check it and try again.',
      ),
    ).toBeVisible();
    expect(dialog).toBeInTheDocument();
  },
};

export const ConnectsAndCloses: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement);

    await userEvent.type(
      within(dialog).getByLabelText('Acme API key'),
      VALID_API_KEY,
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Connect' }),
    );

    await waitFor(() =>
      expect(connectRequest).toHaveBeenCalledWith({
        input: {
          applicationId: APPLICATION_ID,
          providerName: 'acme',
          apiKey: VALID_API_KEY,
        },
      }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const SubmitsWithEnter: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement);

    await userEvent.type(
      within(dialog).getByLabelText('Acme API key'),
      `${VALID_API_KEY}{Enter}`,
    );

    await waitFor(() => expect(connectRequest).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const ResetsWhenReopened: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement);

    await userEvent.type(
      within(dialog).getByLabelText('Acme API key'),
      'wrong-key',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Connect' }),
    );
    await within(dialog).findByText(
      'The Acme API key was rejected. Check it and try again.',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());

    jotaiStore.set(
      isDialogOpenedComponentState.atomFamily({
        instanceId: getApplicationApiKeyConnectionDialogId({
          applicationId: APPLICATION_ID,
          providerName: CONNECTION_PROVIDER.name,
        }),
      }),
      true,
    );

    const reopenedDialog = await findDialog(canvasElement);

    expect(within(reopenedDialog).getByLabelText('Acme API key')).toHaveValue(
      '',
    );
    expect(
      within(reopenedDialog).queryByText(
        'The Acme API key was rejected. Check it and try again.',
      ),
    ).not.toBeInTheDocument();
  },
};
