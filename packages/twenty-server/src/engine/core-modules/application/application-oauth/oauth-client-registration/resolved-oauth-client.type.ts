import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export type ResolvedOAuthClient =
  | {
      kind: 'registeredClient';
      registration: ApplicationRegistrationEntity;
      clientIdMetadataDocument: null;
    }
  | {
      kind: 'wellKnownClientIdMetadataDocument';
      registration: ApplicationRegistrationEntity;
      clientIdMetadataDocument: ClientIdMetadataDocument;
    }
  | {
      kind: 'clientIdMetadataDocument';
      registration: ApplicationRegistrationEntity | null;
      clientIdMetadataDocument: ClientIdMetadataDocument;
    };
