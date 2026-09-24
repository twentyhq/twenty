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

it('prevents adding more than the allowed number of origins', async () => {
  renderSettings(
    Array.from(
      { length: MAX_ALLOWED_IFRAME_ORIGINS },
      (_, index) => `https://portal${index}.example.com`,
    ),
  );
  await screen.findByRole('button', {
    name: 'Remove https://portal0.example.com',
  });
  expect(
    screen.getByRole('textbox', { name: 'Allowed origin' }),
  ).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Add origin' })).toBeDisabled();
});

it('disables edits while the saved policy is unknown', () => {
  renderSettings();
  expect(
    screen.getByRole('textbox', { name: 'Allowed origin' }),
  ).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Add origin' })).toBeDisabled();
});
