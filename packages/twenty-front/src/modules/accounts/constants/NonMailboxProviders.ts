import { ConnectedAccountProvider } from 'twenty-shared/types';

export const NON_MAILBOX_PROVIDERS: ConnectedAccountProvider[] = [
  ConnectedAccountProvider.OIDC,
  ConnectedAccountProvider.SAML,
  ConnectedAccountProvider.APP,
];
