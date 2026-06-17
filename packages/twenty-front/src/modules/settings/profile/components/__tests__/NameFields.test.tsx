import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import {
  type CurrentWorkspaceMember,
  currentWorkspaceMemberState,
} from '@/auth/states/currentWorkspaceMemberState';
import { NameFields } from '@/settings/profile/components/NameFields';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const updateWorkspaceMemberSettingsMock = jest.fn();

jest.mock('@/settings/profile/hooks/useUpdateWorkspaceMemberSettings', () => ({
  useUpdateWorkspaceMemberSettings: jest.fn(),
}));

jest.mock('@/settings/profile/hooks/useCanEditProfileField', () => ({
  useCanEditProfileField: () => ({
    canEdit: true,
    isBlockedByWorkspaceLimit: false,
  }),
}));

// Keep the test focused on NameFields' own logic by replacing the input with a
// plain control (avoids the focus-stack and hotkey machinery of SettingsTextInput).
jest.mock('@/ui/input/components/SettingsTextInput', () => ({
  SettingsTextInput: ({
    label,
    value,
    onChange,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <input
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const mockUseUpdateWorkspaceMemberSettings =
  useUpdateWorkspaceMemberSettings as jest.MockedFunction<
    typeof useUpdateWorkspaceMemberSettings
  >;

const adminMember: CurrentWorkspaceMember = {
  id: 'admin-member-id',
  name: { firstName: 'Alice', lastName: 'Admin' },
  avatarUrl: null,
  locale: 'en',
  colorScheme: 'Light',
  userEmail: 'alice@example.com',
};

const impersonatedMember: CurrentWorkspaceMember = {
  id: 'impersonated-member-id',
  name: { firstName: 'Bob', lastName: 'Basic' },
  avatarUrl: null,
  locale: 'en',
  colorScheme: 'Light',
  userEmail: 'bob@example.com',
};

const renderNameFields = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <NameFields />
      </I18nProvider>
    </JotaiProvider>,
  );

dynamicActivate(SOURCE_LOCALE);

describe('NameFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    resetJotaiStore();
    mockUseUpdateWorkspaceMemberSettings.mockReturnValue({
      updateWorkspaceMemberSettings: updateWorkspaceMemberSettingsMock,
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('does not persist the previous member name when the current workspace member changes identity (impersonation swap)', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, adminMember);

    renderNameFields();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(updateWorkspaceMemberSettingsMock).not.toHaveBeenCalled();

    // Stopping impersonation swaps the current member in place (admin -> ...),
    // after the cached impersonated identity was hydrated from localStorage.
    act(() => {
      jotaiStore.set(currentWorkspaceMemberState.atom, impersonatedMember);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(updateWorkspaceMemberSettingsMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText('First Name')).toHaveValue('Bob');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Basic');
  });

  it('still auto-saves when the user edits their own name', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, adminMember);

    renderNameFields();

    act(() => {
      fireEvent.change(screen.getByLabelText('First Name'), {
        target: { value: 'Alicia' },
      });
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(updateWorkspaceMemberSettingsMock).toHaveBeenCalledTimes(1);
    expect(updateWorkspaceMemberSettingsMock).toHaveBeenCalledWith({
      workspaceMemberId: 'admin-member-id',
      update: { name: { firstName: 'Alicia', lastName: 'Admin' } },
    });
  });
});
