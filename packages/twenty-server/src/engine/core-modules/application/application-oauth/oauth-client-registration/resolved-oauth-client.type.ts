import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { type ResolvedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/types/resolved-oauth-client-registration.type';

export type ResolvedOAuthClient =
  | {
      kind: 'registeredClient';
      registration: ResolvedOAuthClientRegistration;
      clientIdMetadataDocument: null;
    }
  | {
      kind: 'wellKnownClientIdMetadataDocument';
      registration: ResolvedOAuthClientRegistration;
      clientIdMetadataDocument: ClientIdMetadataDocument;
    }
  | {
      kind: 'clientIdMetadataDocument';
      registration: ResolvedOAuthClientRegistration | null;
      clientIdMetadataDocument: ClientIdMetadataDocument;
    };
