import { CLIENT_ID_METADATA_DOCUMENT_LIMITS } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-limits.constant';
import { buildClientIdMetadataDocumentCacheEntry } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/build-client-id-metadata-document-cache-entry.util';

const HOUR_MS = 60 * 60 * 1000;

const DOCUMENT = {
  clientId: 'https://claude.ai/oauth/claude-code-client-metadata',
  clientName: 'Claude Code',
  logoUri: null,
  redirectUris: ['http://localhost/callback'],
};

const PREVIOUS_DOCUMENT = { ...DOCUMENT, clientName: 'Claude Code (old)' };

const FETCHED_AT = 1_000_000;

const CACHED_ENTRY = {
  document: PREVIOUS_DOCUMENT,
  checkedAt: FETCHED_AT + 22 * HOUR_MS,
  fetchedAt: FETCHED_AT,
};

describe('buildClientIdMetadataDocumentCacheEntry', () => {
  it('stores a fetched document for the full stale window', () => {
    const now = FETCHED_AT + 23 * HOUR_MS;

    expect(
      buildClientIdMetadataDocumentCacheEntry({
        fetchResult: { status: 'fetched', document: DOCUMENT },
        cachedEntry: CACHED_ENTRY,
        now,
      }),
    ).toEqual({
      entry: { document: DOCUMENT, checkedAt: now, fetchedAt: now },
      ttlMs: CLIENT_ID_METADATA_DOCUMENT_LIMITS.staleCacheTtlMs,
    });
  });

  it('keeps the last good document through an outage until its window ends', () => {
    const now = FETCHED_AT + 23 * HOUR_MS;

    expect(
      buildClientIdMetadataDocumentCacheEntry({
        fetchResult: { status: 'unreachable' },
        cachedEntry: CACHED_ENTRY,
        now,
      }),
    ).toEqual({
      entry: {
        document: PREVIOUS_DOCUMENT,
        checkedAt: now,
        fetchedAt: FETCHED_AT,
      },
      ttlMs: HOUR_MS,
    });
  });

  it('drops the last good document once its window has passed', () => {
    const now = FETCHED_AT + CLIENT_ID_METADATA_DOCUMENT_LIMITS.staleCacheTtlMs;

    expect(
      buildClientIdMetadataDocumentCacheEntry({
        fetchResult: { status: 'unreachable' },
        cachedEntry: CACHED_ENTRY,
        now,
      }),
    ).toEqual({
      entry: { document: null, checkedAt: now, fetchedAt: null },
      ttlMs: CLIENT_ID_METADATA_DOCUMENT_LIMITS.unreachableRetryAfterMs,
    });
  });

  it('has nothing to serve during an outage without a cached document', () => {
    expect(
      buildClientIdMetadataDocumentCacheEntry({
        fetchResult: { status: 'unreachable' },
        cachedEntry: undefined,
        now: FETCHED_AT,
      }),
    ).toEqual({
      entry: { document: null, checkedAt: FETCHED_AT, fetchedAt: null },
      ttlMs: CLIENT_ID_METADATA_DOCUMENT_LIMITS.unreachableRetryAfterMs,
    });
  });

  it('drops the cached document when the new one is invalid or withdrawn', () => {
    const now = FETCHED_AT + HOUR_MS;

    expect(
      buildClientIdMetadataDocumentCacheEntry({
        fetchResult: { status: 'invalid' },
        cachedEntry: CACHED_ENTRY,
        now,
      }),
    ).toEqual({
      entry: { document: null, checkedAt: now, fetchedAt: null },
      ttlMs: CLIENT_ID_METADATA_DOCUMENT_LIMITS.refreshAfterMs,
    });
  });
});
