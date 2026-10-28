export const canStartConnectionProviderAuthorization = (provider: {
  type: string;
  oauth?: { isClientCredentialsConfigured: boolean } | null;
}) =>
  provider.type !== 'oauth' ||
  (provider.oauth?.isClientCredentialsConfigured ?? false);
