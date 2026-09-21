import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { type DialogPopupProps } from 'twenty-ui/primitives/surfaces';

import { FrontComponentMediaPermissionModal } from '@/front-components/media-session/components/FrontComponentMediaPermissionModal';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { GrantApplicationCapabilitiesDocument } from '~/generated-metadata/graphql';

jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock('@/ui/layout/dialog/components/DialogInstance', () => {
  const { Dialog } = jest.requireActual('twenty-ui/primitives/surfaces');

  return {
    DialogInstance: ({
      children,
    }: {
      children: (props: DialogPopupProps) => ReactNode;
    }) => <Dialog.Root open>{children({})}</Dialog.Root>,
  };
});

const APPLICATION_ID = 'application-id';
const GRANT_REQUEST = {
  query: GrantApplicationCapabilitiesDocument,
  variables: {
    input: { applicationId: APPLICATION_ID, capabilities: ['microphone'] },
  },
};
const GRANT_RESULT = {
  data: {
    grantApplicationCapabilities: {
      __typename: 'ApplicationCapabilityGrant',
      id: APPLICATION_ID,
      grantedCapabilities: ['microphone', 'camera'],
    },
  },
};

const renderPermissionModal = (mocks: MockedResponse[] = []) => {
  const controller = new AbortController();
  const resolve = jest.fn();

  render(
    <MockedProvider mocks={mocks}>
      <I18nProvider i18n={i18n}>
        <FrontComponentMediaPermissionModal
          applicationId={APPLICATION_ID}
          applicationName="Media Notes"
          modalInstanceId="media-permission"
          request={{
            capabilities: ['microphone'],
            abortSignal: controller.signal,
            resolve,
          }}
        />
      </I18nProvider>
    </MockedProvider>,
  );

  return { controller, resolve };
};

describe('FrontComponentMediaPermissionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
  });

  it('explains workspace-wide access and waits for the saved grant', async () => {
    const { resolve } = renderPermissionModal([
      { request: GRANT_REQUEST, result: GRANT_RESULT, delay: 50 },
    ]);

    expect(
      screen.getByText('Allow media access for Media Notes?'),
    ).toBeVisible();
    expect(screen.getByText('Use your microphone')).toBeVisible();
    expect(screen.queryByText('Use your camera')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'This grants access to this app for everyone in your workspace.',
      ),
    ).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Authorize' }));

    expect(resolve).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Authorizing...' }),
    ).toBeDisabled();
    await waitFor(() =>
      expect(resolve).toHaveBeenCalledWith(['microphone', 'camera']),
    );
  });

  it('cancels without saving a grant', async () => {
    const saveGrant = jest.fn(() => GRANT_RESULT);
    const { resolve } = renderPermissionModal([
      { request: GRANT_REQUEST, result: saveGrant },
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(resolve).toHaveBeenCalledWith(null);
    expect(saveGrant).not.toHaveBeenCalled();
  });

  it('asks members without manage-apps permission to contact an administrator', async () => {
    jest.mocked(useHasPermissionFlag).mockReturnValue(false);
    const { resolve } = renderPermissionModal();

    expect(
      screen.getByText(
        'Only members who can manage apps can grant access. Ask your workspace administrator.',
      ),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Authorize' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(resolve).toHaveBeenCalledWith(null);
  });

  it('keeps capture blocked after a failed save and allows retrying', async () => {
    const { resolve } = renderPermissionModal([
      { request: GRANT_REQUEST, error: new Error('Save failed') },
      { request: GRANT_REQUEST, result: GRANT_RESULT },
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Authorize' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not grant media access. Please try again.',
    );
    expect(resolve).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Authorize' }));

    await waitFor(() =>
      expect(resolve).toHaveBeenCalledWith(['microphone', 'camera']),
    );
  });

  it('does not resume a capture that was aborted while saving', async () => {
    const saveGrant = jest.fn(() => GRANT_RESULT);
    const { controller, resolve } = renderPermissionModal([
      { request: GRANT_REQUEST, result: saveGrant, delay: 50 },
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Authorize' }));
    controller.abort();

    await waitFor(() => expect(saveGrant).toHaveBeenCalled());
    expect(resolve).not.toHaveBeenCalled();
  });
});
