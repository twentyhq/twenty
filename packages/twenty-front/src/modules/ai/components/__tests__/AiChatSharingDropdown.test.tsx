import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { AiChatSharingDropdown } from '@/ai/components/AiChatSharingDropdown';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordSharingDropdown } from '@/object-record/record-sharing/components/RecordSharingDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const mockRefetch = jest.fn().mockResolvedValue(undefined);
let mockRecordSharingEnabled = true;

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: { id: 'thread-object' } }),
}));
jest.mock('@/object-record/record-sharing/hooks/useRecordSharing', () => ({
  useRecordSharing: () => ({
    sharing: { isEnabled: mockRecordSharingEnabled },
    refetch: mockRefetch,
  }),
}));
jest.mock(
  '@/object-record/record-sharing/components/RecordSharingDropdownContent',
  () => ({
    RecordSharingDropdownContent: () => <div>Sharing settings</div>,
  }),
);

const setup = (isDropdownEnabled?: boolean) => {
  const store = createStore();
  const setDropdownEnabled = (enabled?: boolean) => {
    store.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: mockRecordSharingEnabled,
        },
        ...(enabled === undefined
          ? []
          : [
              {
                key: FeatureFlagKey.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED,
                value: enabled,
              },
            ]),
      ],
    });
  };
  setDropdownEnabled(isDropdownEnabled);

  const renderDropdown = (isChat = true) =>
    render(
      <Provider store={store}>
        <I18nProvider i18n={i18n}>
          {isChat ? (
            <AiChatSharingDropdown threadId="thread" />
          ) : (
            <RecordSharingDropdown
              target={{ objectMetadataId: 'other-object', recordId: 'record' }}
              title="Share record"
              recordUrl="/record"
            />
          )}
        </I18nProvider>
      </Provider>,
    );

  return { store, setDropdownEnabled, renderDropdown };
};

describe('AI chat sharing rollout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecordSharingEnabled = true;
  });

  it.each([
    [true, undefined, false],
    [true, false, false],
    [true, true, true],
    [false, undefined, false],
    [false, false, false],
    [false, true, false],
  ])(
    'with backend sharing=%s and chat dropdown=%s, shows Share=%s',
    (isRecordSharingEnabled, isDropdownEnabled, isVisible) => {
      mockRecordSharingEnabled = isRecordSharingEnabled;
      setup(isDropdownEnabled).renderDropdown();

      if (isVisible) {
        expect(screen.getByRole('button', { name: 'Share' })).toBeVisible();
      } else {
        expect(screen.queryByRole('button', { name: 'Share' })).toBeNull();
      }
    },
  );

  it('keeps sharing available for other objects when the chat dropdown is disabled', () => {
    setup(false).renderDropdown(false);

    expect(screen.getByRole('button', { name: 'Share' })).toBeVisible();
  });

  it('closes the dropdown and releases focus when its flag is disabled', async () => {
    const user = userEvent.setup();
    const { store, renderDropdown, setDropdownEnabled } = setup(true);
    renderDropdown();
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(screen.getByText('Sharing settings')).toBeVisible();

    act(() => setDropdownEnabled(false));

    expect(screen.queryByRole('button', { name: 'Share' })).toBeNull();
    expect(screen.queryByText('Sharing settings')).toBeNull();
    expect(store.get(activeDropdownFocusIdState.atom)).not.toBe(
      'record-sharing-thread-object-thread',
    );

    act(() => setDropdownEnabled(true));

    expect(screen.getByRole('button', { name: 'Share' })).toBeVisible();
    expect(screen.queryByText('Sharing settings')).toBeNull();
  });
});
