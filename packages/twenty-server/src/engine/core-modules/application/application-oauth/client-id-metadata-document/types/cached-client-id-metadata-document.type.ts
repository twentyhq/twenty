import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';

// checkedAt is the last fetch attempt, fetchedAt when the served document was fetched (null when none is served)
export type CachedClientIdMetadataDocument =
  | {
      document: ClientIdMetadataDocument;
      checkedAt: number;
      fetchedAt: number;
    }
  | { document: null; checkedAt: number; fetchedAt: null };
