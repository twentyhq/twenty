import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { SignInUpWorkspaceCreationFormV2 } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceCreationFormV2';
import { isCreatingWorkspaceState } from '@/auth/states/isCreatingWorkspaceState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const createWorkspaceMock = jest.fn();
const applySuggestionValueMock = jest.fn();
const handleSubdomainChangeMock = jest.fn();
const handleWorkspaceNameChangeMock = jest.fn();
const useWorkspaceSubdomainFieldMock = jest.fn();

jest.mock('@/auth/sign-in-up/hooks/useSignUpInNewWorkspace', () => ({
  useSignUpInNewWorkspace: () => ({ createWorkspace: createWorkspaceMock }),
}));

jest.mock('@/auth/sign-in-up/hooks/useWorkspaceSubdomainField', () => ({
  useWorkspaceSubdomainField: () => useWorkspaceSubdomainFieldMock(),
}));

global.URL.createObjectURL = jest.fn(() => 'blob:logo-preview');
global.URL.revokeObjectURL = jest.fn();

dynamicActivate(SOURCE_LOCALE);

const setMultiWorkspaceEnabled = (isEnabled: boolean) => {
  jotaiStore.set(isMultiWorkspaceEnabledState.atom, isEnabled);
};

const renderForm = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <ThemeProvider colorScheme="light">
        <I18nProvider i18n={i18n}>
          <SignInUpWorkspaceCreationFormV2 />
        </I18nProvider>
      </ThemeProvider>
    </JotaiProvider>,
  );

describe('SignInUpWorkspaceCreationFormV2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    useWorkspaceSubdomainFieldMock.mockReturnValue({
      workspaceName: 'Apple',
      subdomain: 'apple',
      status: 'available',
      errorMessage: undefined,
      suggestions: [],
      isAvailable: true,
      handleWorkspaceNameChange: handleWorkspaceNameChangeMock,
      handleSubdomainChange: handleSubdomainChangeMock,
      applySuggestionValue: applySuggestionValueMock,
    });
  });

  describe('multi-workspace', () => {
    beforeEach(() => {
      setMultiWorkspaceEnabled(true);
    });

    it('creates the workspace with the chosen name and subdomain', async () => {
      createWorkspaceMock.mockResolvedValue(true);

      renderForm();

      const createButton = screen.getByRole('button', {
        name: 'Create workspace',
      });
      expect(createButton).toBeEnabled();

      await act(async () => {
        fireEvent.click(createButton);
      });

      expect(createWorkspaceMock).toHaveBeenCalledWith({
        displayName: 'Apple',
        subdomain: 'apple',
        logo: undefined,
      });
    });

    it('keeps the loader on through a successful creation, until the redirect', async () => {
      let resolveCreateWorkspace: () => void = () => {};
      createWorkspaceMock.mockReturnValue(
        new Promise<boolean>((resolve) => {
          resolveCreateWorkspace = () => resolve(true);
        }),
      );

      renderForm();

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'Create workspace' }),
        );
      });

      expect(jotaiStore.get(isCreatingWorkspaceState.atom)).toBe(true);
      expect(createWorkspaceMock).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveCreateWorkspace();
      });

      expect(jotaiStore.get(isCreatingWorkspaceState.atom)).toBe(true);
    });

    it('returns to the form when workspace creation fails', async () => {
      createWorkspaceMock.mockResolvedValue(false);

      renderForm();

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'Create workspace' }),
        );
      });

      expect(jotaiStore.get(isCreatingWorkspaceState.atom)).toBe(false);
    });

    it('does not call createWorkspace again while a creation is in flight', () => {
      jotaiStore.set(isCreatingWorkspaceState.atom, true);

      renderForm();

      expect(
        screen.getByText('Creating your workspace...'),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Create workspace' }),
      ).not.toBeInTheDocument();
    });

    it('lists available alternatives and applies the picked one when the subdomain is taken', () => {
      useWorkspaceSubdomainFieldMock.mockReturnValue({
        workspaceName: 'Stripe',
        subdomain: 'stripe',
        status: 'unavailable',
        errorMessage: undefined,
        suggestions: ['stripe-2', 'mystripe', 'stripeeinc'],
        isAvailable: false,
        handleWorkspaceNameChange: handleWorkspaceNameChangeMock,
        handleSubdomainChange: handleSubdomainChangeMock,
        applySuggestionValue: applySuggestionValueMock,
      });

      renderForm();

      expect(
        screen.getByText(
          'Subdomain already in use, here are some alternatives:',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create workspace' }),
      ).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'mystripe' }));

      expect(applySuggestionValueMock).toHaveBeenCalledWith('mystripe');
    });
  });

  describe('single-workspace', () => {
    beforeEach(() => {
      setMultiWorkspaceEnabled(false);
    });

    it('hides the subdomain field and creates without a subdomain', async () => {
      createWorkspaceMock.mockResolvedValue(true);

      renderForm();

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('Subdomain')).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'Create workspace' }),
        );
      });

      expect(createWorkspaceMock).toHaveBeenCalledWith({
        displayName: 'Apple',
        logo: undefined,
      });
      expect(createWorkspaceMock.mock.calls[0][0]).not.toHaveProperty(
        'subdomain',
      );
    });
  });
});
