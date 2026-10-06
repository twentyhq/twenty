import { ConnectedAccountProvider } from 'twenty-shared/types';

// Google, Microsoft and IMAP/SMTP/CalDAV are not applications yet. Until they
// become real apps, the app preferences page presents them as preinstalled ones.
export const getPreinstalledApplicationForProvider = (
  provider: ConnectedAccountProvider,
): { name: string } | undefined => {
  switch (provider) {
    case ConnectedAccountProvider.GOOGLE:
      return { name: 'Google' };
    case ConnectedAccountProvider.MICROSOFT:
      return { name: 'Microsoft' };
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return { name: 'IMAP / SMTP / CalDAV' };
    default:
      return undefined;
  }
};
