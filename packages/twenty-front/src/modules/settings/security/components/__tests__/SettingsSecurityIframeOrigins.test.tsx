import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MAX_ALLOWED_IFRAME_ORIGINS } from 'twenty-shared/constants';

import { SettingsSecurityIframeOrigins } from '@/settings/security/components/SettingsSecurityIframeOrigins';
import {
  GetWorkspaceIframeOriginsDocument,
  UpdateWorkspaceAllowedIframeOriginsDocument,
} from '~/generated-metadata/graphql';

const enqueueToast = jest.fn();

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast }),
}));

const workspace = (origins: string[]) => ({
  __typename: 'Workspace' as const,
  id: 'workspace-id',
  allowedIframeOrigins: origins,
});

const renderSettings = (
  origins: string[] = [],
  mutations: MockedResponse[] = [],
) =>
  render(
    <Provider store={createStore()}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetWorkspaceIframeOriginsDocument },
            result: { data: { currentWorkspace: workspace(origins) } },
          },
          ...mutations,
        ]}
      >
        <I18nProvider i18n={i18n}>
          <SettingsSecurityIframeOrigins />
        </I18nProvider>
      </MockedProvider>
    </Provider>,
  );

const editableInput = async () => {
  const input = screen.getByRole('textbox', { name: 'Allowed origin' });
  await waitFor(() => expect(input).toBeEnabled());
  return input;
};

beforeEach(() => jest.clearAllMocks());

it.each(['button', 'Enter'])(
  'adds normalized origins with %s and removes the last origin',
  async (method) => {
    const added = jest.fn(() => ({
      data: {
        updateWorkspaceAllowedIframeOrigins: workspace([
          'https://portal.example.com',
        ]),
      },
    }));
    const removed = jest.fn(() => ({
      data: { updateWorkspaceAllowedIframeOrigins: workspace([]) },
    }));
    renderSettings(
      [],
      [
        {
          request: {
            query: UpdateWorkspaceAllowedIframeOriginsDocument,
            variables: {
              input: { operation: 'add', origin: 'https://portal.example.com' },
            },
          },
          result: added,
        },
        {
          request: {
            query: UpdateWorkspaceAllowedIframeOriginsDocument,
            variables: {
              input: {
                operation: 'remove',
                origin: 'https://portal.example.com',
              },
            },
          },
          result: removed,
        },
      ],
    );
    const user = userEvent.setup();
    await user.type(await editableInput(), 'https://PORTAL.example.com:443/');
    if (method === 'Enter') await user.keyboard('{Enter}');
    else await user.click(screen.getByRole('button', { name: 'Add origin' }));
    await user.click(
      await screen.findByRole('button', {
        name: 'Remove https://portal.example.com',
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /Remove/ }),
      ).not.toBeInTheDocument(),
    );
    expect(added).toHaveBeenCalledTimes(1);
    expect(removed).toHaveBeenCalledTimes(1);
  },
);

it('explains invalid origins without sending a mutation', async () => {
  renderSettings();
  const user = userEvent.setup();
  await user.type(await editableInput(), 'https://portal.example.com/path');
  await user.click(screen.getByRole('button', { name: 'Add origin' }));
  expect(
    await screen.findByText(/without a path or wildcard/),
  ).toBeInTheDocument();
  expect(enqueueToast).not.toHaveBeenCalled();
});

it('keeps saved origins when the server rejects an update', async () => {
  renderSettings(
    ['https://portal.example.com'],
    [
      {
        request: {
          query: UpdateWorkspaceAllowedIframeOriginsDocument,
          variables: {
            input: {
              operation: 'remove',
              origin: 'https://portal.example.com',
            },
          },
        },
        error: new Error('Permission denied'),
      },
    ],
  );
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole('button', {
      name: 'Remove https://portal.example.com',
    }),
  );
  await waitFor(() => expect(enqueueToast).toHaveBeenCalled());
  expect(
    screen.getByRole('button', { name: 'Remove https://portal.example.com' }),
  ).toBeInTheDocument();
});

it('allows an addition when another administrator frees a slot in a full list', async () => {
  const staleOrigins = Array.from(
    { length: MAX_ALLOWED_IFRAME_ORIGINS },
    (_, index) => `https://portal${index}.example.com`,
  );
  const newOrigin = 'https://new.example.com';
  const updatedOrigins = [...staleOrigins.slice(1), newOrigin];
  const saved = jest.fn(() => ({
    data: { updateWorkspaceAllowedIframeOrigins: workspace(updatedOrigins) },
  }));
  renderSettings(staleOrigins, [
    {
      request: {
        query: UpdateWorkspaceAllowedIframeOriginsDocument,
        variables: { input: { operation: 'add', origin: newOrigin } },
      },
      result: saved,
    },
  ]);
  const user = userEvent.setup();
  await user.type(await editableInput(), newOrigin);
  await user.click(screen.getByRole('button', { name: 'Add origin' }));
  expect(
    await screen.findByRole('button', { name: `Remove ${newOrigin}` }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: `Remove ${staleOrigins[0]}` }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(
    MAX_ALLOWED_IFRAME_ORIGINS,
  );
  expect(saved).toHaveBeenCalledTimes(1);
});

it('keeps the saved list and input when the server rejects an addition at the limit', async () => {
  const origins = Array.from(
    { length: MAX_ALLOWED_IFRAME_ORIGINS },
    (_, index) => `https://portal${index}.example.com`,
  );
  const newOrigin = 'https://new.example.com';
  renderSettings(origins, [
    {
      request: {
        query: UpdateWorkspaceAllowedIframeOriginsDocument,
        variables: { input: { operation: 'add', origin: newOrigin } },
      },
      error: new Error(
        `You can allow up to ${MAX_ALLOWED_IFRAME_ORIGINS} origins.`,
      ),
    },
  ]);
  const user = userEvent.setup();
  const input = await editableInput();
  await user.type(input, newOrigin);
  await user.click(screen.getByRole('button', { name: 'Add origin' }));
  await waitFor(() => expect(enqueueToast).toHaveBeenCalled());
  expect(input).toHaveValue(newOrigin);
  expect(input).toBeEnabled();
  expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(
    MAX_ALLOWED_IFRAME_ORIGINS,
  );
  expect(
    screen.queryByRole('button', { name: `Remove ${newOrigin}` }),
  ).not.toBeInTheDocument();
});

it('disables edits while the saved policy is unknown', () => {
  renderSettings();
  expect(
    screen.getByRole('textbox', { name: 'Allowed origin' }),
  ).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Add origin' })).toBeDisabled();
});
