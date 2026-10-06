import { getPreinstalledApplicationForProvider } from '@/settings/app-preferences/utils/getPreinstalledApplicationForProvider';
import { ConnectedAccountProvider } from 'twenty-shared/types';

describe('getPreinstalledApplicationForProvider', () => {
  it.each([
    [ConnectedAccountProvider.GOOGLE, 'Google'],
    [ConnectedAccountProvider.MICROSOFT, 'Microsoft'],
    [ConnectedAccountProvider.IMAP_SMTP_CALDAV, 'IMAP / SMTP / CalDAV'],
  ])('should present %s as a preinstalled application', (provider, name) => {
    expect(getPreinstalledApplicationForProvider(provider)).toEqual({ name });
  });

  it('should return nothing for an application-managed account', () => {
    expect(
      getPreinstalledApplicationForProvider(ConnectedAccountProvider.APP),
    ).toBeUndefined();
  });
});
