import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';

const mockTriggerApisOAuth = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@/settings/accounts/hooks/useTriggerApiOAuth', () => ({
  useTriggerApisOAuth: jest.fn().mockImplementation(() => ({
    triggerApisOAuth: mockTriggerApisOAuth,
  })),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: jest.fn().mockImplementation(() => mockNavigate),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useTriggerProviderReconnect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IMAP_SMTP_CALDAV provider', () => {
    it('should navigate to new connection when no accountId is provided', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        SettingsPath.NewImapSmtpCaldavConnection,
      );
      expect(mockTriggerApisOAuth).not.toHaveBeenCalled();
    });

    it('should navigate to edit connection when accountId is provided', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      const accountId = 'test-account-id-123';

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          accountId,
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        SettingsPath.EditImapSmtpCaldavConnection,
        {
          connectedAccountId: accountId,
        },
      );
      expect(mockTriggerApisOAuth).not.toHaveBeenCalled();
    });

    it('should ignore options parameter for IMAP_SMTP_CALDAV provider', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      const accountId = 'test-account-id-123';
      const options = {
        redirectLocation: '/some-path',
        calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      };

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          accountId,
          options,
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        SettingsPath.EditImapSmtpCaldavConnection,
        {
          connectedAccountId: accountId,
        },
      );
      expect(mockTriggerApisOAuth).not.toHaveBeenCalled();
    });
  });

  describe('OAuth providers', () => {
    it('should trigger OAuth for Google provider without options', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.GOOGLE,
        );
      });

      expect(mockTriggerApisOAuth).toHaveBeenCalledWith(
        ConnectedAccountProvider.GOOGLE,
        {
          redirectLocation: '/settings/accounts',
        },
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should trigger OAuth for Microsoft provider without options', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.MICROSOFT,
        );
      });

      expect(mockTriggerApisOAuth).toHaveBeenCalledWith(
        ConnectedAccountProvider.MICROSOFT,
        {
          redirectLocation: '/settings/accounts',
        },
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should trigger OAuth for Google provider with options', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      const options = {
        redirectLocation: '/custom-redirect',
        calendarVisibility: CalendarChannelVisibility.METADATA,
        messageVisibility: MessageChannelVisibility.SUBJECT,
        loginHint: 'user@example.com',
      };

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.GOOGLE,
          undefined,
          options,
        );
      });

      expect(mockTriggerApisOAuth).toHaveBeenCalledWith(
        ConnectedAccountProvider.GOOGLE,
        {
          ...options,
          redirectLocation: '/settings/accounts',
        },
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should trigger OAuth for Microsoft provider with options', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      const options = {
        redirectLocation: '/another-redirect',
        calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
        messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
      };

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.MICROSOFT,
          'some-account-id',
          options,
        );
      });

      expect(mockTriggerApisOAuth).toHaveBeenCalledWith(
        ConnectedAccountProvider.MICROSOFT,
        {
          ...options,
          redirectLocation: '/settings/accounts',
        },
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should ignore accountId parameter for OAuth providers', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.triggerProviderReconnect(
          ConnectedAccountProvider.GOOGLE,
          'ignored-account-id',
        );
      });

      expect(mockTriggerApisOAuth).toHaveBeenCalledWith(
        ConnectedAccountProvider.GOOGLE,
        {
          redirectLocation: '/settings/accounts',
        },
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle triggerApisOAuth errors gracefully', async () => {
      const { result } = renderHook(() => useTriggerProviderReconnect(), {
        wrapper: Wrapper,
      });

      const error = new Error('OAuth failed');
      mockTriggerApisOAuth.mockRejectedValue(error);

      await expect(async () => {
        await act(async () => {
          await result.current.triggerProviderReconnect(
            ConnectedAccountProvider.GOOGLE,
          );
        });
      }).rejects.toThrow('OAuth failed');

      expect(mockTriggerApisOAuth).toHaveBeenCalledWith(
        ConnectedAccountProvider.GOOGLE,
        {
          redirectLocation: '/settings/accounts',
        },
      );
    });
  });
});
