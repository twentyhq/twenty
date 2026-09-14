import { describe, expect, it } from 'vitest';

import { parseTwentyRecordLinks } from 'src/logic-functions/utils/parse-twenty-record-links';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';
const RECORD_ID = '20202020-0713-4b29-8f43-1111e2f6a4b1';

describe('parseTwentyRecordLinks', () => {
  it('should match a link on any workspace host and canonicalize it to the first', () => {
    const subdomainUrl = 'https://acme.twenty.com';
    const customUrl = 'https://crm.acme.com';
    const sharedUrl = `${subdomainUrl}/object/person/${RECORD_ID}`;

    const [recordLink] = parseTwentyRecordLinks({
      workspaceBaseUrls: [customUrl, subdomainUrl],
      urls: [sharedUrl],
    });

    expect(recordLink).toEqual({
      sharedUrl,
      canonicalUrl: `${customUrl}/object/person/${RECORD_ID}`,
      objectNameSingular: 'person',
      recordId: RECORD_ID,
    });
  });

  it('should deduplicate a record shared from two different workspace hosts', () => {
    const subdomainUrl = 'https://acme.twenty.com';
    const customUrl = 'https://crm.acme.com';

    const recordLinks = parseTwentyRecordLinks({
      workspaceBaseUrls: [customUrl, subdomainUrl],
      urls: [
        `${customUrl}/object/person/${RECORD_ID}`,
        `${subdomainUrl}/object/person/${RECORD_ID}`,
      ],
    });

    expect(recordLinks).toHaveLength(1);
  });

  it('should parse a record link for every supported object', () => {
    const urls = ['person', 'company', 'opportunity', 'note', 'task'].map(
      (objectNameSingular) =>
        `${WORKSPACE_BASE_URL}/object/${objectNameSingular}/${RECORD_ID}`,
    );

    const recordLinks = parseTwentyRecordLinks({
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
      urls,
    });

    expect(recordLinks.map((recordLink) => recordLink.objectNameSingular)).toEqual([
      'person',
      'company',
      'opportunity',
      'note',
      'task',
    ]);
    expect(recordLinks[0]).toEqual({
      sharedUrl: urls[0],
      canonicalUrl: urls[0],
      objectNameSingular: 'person',
      recordId: RECORD_ID,
    });
  });

  it.each([
    ['a query param', `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}?view=table`],
    ['a fragment', `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}#section`],
    ['a trailing slash', `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}/`],
  ])('should keep %s off the parsed record id', (_label, url) => {
    expect(
      parseTwentyRecordLinks({
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
        urls: [url],
      }).map((recordLink) => recordLink.recordId),
    ).toEqual([RECORD_ID]);
  });

  it('should normalize the HTML-escaped ampersands Slack sends', () => {
    const recordLinks = parseTwentyRecordLinks({
      workspaceBaseUrls: [WORKSPACE_BASE_URL],
      urls: [`${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}?a=1&amp;b=2`],
    });

    expect(recordLinks).toHaveLength(1);
  });

  it('should deduplicate repeated URLs', () => {
    const url = `${WORKSPACE_BASE_URL}/object/company/${RECORD_ID}`;

    expect(
      parseTwentyRecordLinks({
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
        urls: [url, url, url],
      }),
    ).toHaveLength(1);
  });

  it('should deduplicate URL spellings that point at the same record', () => {
    expect(
      parseTwentyRecordLinks({
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
        urls: [
          `${WORKSPACE_BASE_URL}/object/company/${RECORD_ID}`,
          `${WORKSPACE_BASE_URL}/object/company/${RECORD_ID}/`,
          `${WORKSPACE_BASE_URL}/object/company/${RECORD_ID}?a=1&b=2`,
          `${WORKSPACE_BASE_URL}/object/company/${RECORD_ID}?a=1&amp;b=2`,
        ],
      }),
    ).toHaveLength(1);
  });

  it('should keep the shared URL for matching and a canonical URL for the link', () => {
    const sharedUrl = `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}?view=table#top`;

    expect(
      parseTwentyRecordLinks({
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
        urls: [sharedUrl],
      })[0],
    ).toEqual({
      sharedUrl,
      canonicalUrl: `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}`,
      objectNameSingular: 'person',
      recordId: RECORD_ID,
    });
  });

  it('should skip links from another host', () => {
    expect(
      parseTwentyRecordLinks({
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
        urls: [
          `https://other.twenty.com/object/person/${RECORD_ID}`,
          `https://acme.twenty.com.evil.com/object/person/${RECORD_ID}`,
        ],
      }),
    ).toEqual([]);
  });

  it('should skip unsupported objects, non-record paths and invalid ids', () => {
    expect(
      parseTwentyRecordLinks({
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
        urls: [
          `${WORKSPACE_BASE_URL}/object/rocket/${RECORD_ID}`,
          `${WORKSPACE_BASE_URL}/settings/members`,
          `${WORKSPACE_BASE_URL}/object/person/not-a-uuid`,
          `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}/extra`,
        ],
      }),
    ).toEqual([]);
  });
});
