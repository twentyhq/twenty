import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';

export type ClientIdMetadataDocumentFetchResult =
  | { status: 'fetched'; document: ClientIdMetadataDocument }
  | { status: 'invalid' | 'unreachable' };
