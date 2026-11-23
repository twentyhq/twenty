import { getMessageChannelLabel } from '@/activities/emails/utils/getMessageChannelLabel';
import { ConnectedAccountProvider } from 'twenty-shared/types';

describe('getMessageChannelLabel', () => {
  it('should name the built-in account app of the provider', () => {
    expect(
      getMessageChannelLabel({
        channel: {
          provider: ConnectedAccountProvider.GOOGLE,
          applicationId: null,
        },
        currentWorkspace: null,
      }),
    ).toBe('Gmail and Calendar');
  });

  it('should fall back to Email for an unknown provider', () => {
    expect(
      getMessageChannelLabel({ channel: undefined, currentWorkspace: null }),
    ).toBe('Email');
  });

  it('should name the installed application of an app channel', () => {
    expect(
      getMessageChannelLabel({
        channel: {
          provider: ConnectedAccountProvider.APP,
          applicationId: 'application-id',
        },
        currentWorkspace: null,
      }),
    ).toBe('Application');
  });
});
