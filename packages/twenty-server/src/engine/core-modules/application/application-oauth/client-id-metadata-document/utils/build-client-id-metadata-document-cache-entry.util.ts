import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { CLIENT_ID_METADATA_DOCUMENT_LIMITS } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-limits.constant';
import { type CachedClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/cached-client-id-metadata-document.type';
import { type ClientIdMetadataDocumentFetchResult } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document-fetch-result.type';

const buildEntry = ({
  fetchResult,
  cachedEntry,
  now,
}: {
  fetchResult: ClientIdMetadataDocumentFetchResult;
  cachedEntry: CachedClientIdMetadataDocument | undefined;
  now: number;
}): CachedClientIdMetadataDocument => {
  switch (fetchResult.status) {
    case 'fetched':
      return { document: fetchResult.document, checkedAt: now, fetchedAt: now };
    case 'unreachable':
      if (
        isDefined(cachedEntry?.document) &&
        now - cachedEntry.fetchedAt <
          CLIENT_ID_METADATA_DOCUMENT_LIMITS.staleCacheTtlMs
      ) {
        return { ...cachedEntry, checkedAt: now };
      }

      return { document: null, checkedAt: now, fetchedAt: null };
    case 'invalid':
      return { document: null, checkedAt: now, fetchedAt: null };
    default:
      return assertUnreachable(fetchResult);
  }
};

// Failures are cached too so requests stop waiting on the vendor, and an outage never extends the last good copy
export const buildClientIdMetadataDocumentCacheEntry = ({
  fetchResult,
  cachedEntry,
  now,
}: {
  fetchResult: ClientIdMetadataDocumentFetchResult;
  cachedEntry: CachedClientIdMetadataDocument | undefined;
  now: number;
}): { entry: CachedClientIdMetadataDocument; ttlMs: number } => {
  const entry = buildEntry({ fetchResult, cachedEntry, now });

  return {
    entry,
    ttlMs: isDefined(entry.fetchedAt)
      ? CLIENT_ID_METADATA_DOCUMENT_LIMITS.staleCacheTtlMs -
        (now - entry.fetchedAt)
      : CLIENT_ID_METADATA_DOCUMENT_LIMITS.refreshAfterMs,
  };
};
