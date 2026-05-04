import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';

export const encodeOAuthBody = (
  contentType: OAuthProviderTokenRequestContentType,
  params: Record<string, string>,
): { body: string; contentTypeHeader: string } =>
  contentType === 'json'
    ? {
        body: JSON.stringify(params),
        contentTypeHeader: 'application/json',
      }
    : {
        body: new URLSearchParams(params).toString(),
        contentTypeHeader: 'application/x-www-form-urlencoded',
      };
