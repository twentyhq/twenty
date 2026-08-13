import { describe, expect, it } from 'vitest';

import { parseSlackRecordLink } from 'src/logic-functions/utils/parse-slack-record-link';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';
const RECORD_ID = '6b1e6a4b-5e3f-4c2d-9a8b-1f2e3d4c5b6a';

describe('parseSlackRecordLink', () => {
  it('should parse an object record link on the workspace domain', () => {
    const parsed = parseSlackRecordLink({
      linkUrl: `${WORKSPACE_BASE_URL}/object/opportunity/${RECORD_ID}`,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(parsed).toEqual({
      linkUrl: `${WORKSPACE_BASE_URL}/object/opportunity/${RECORD_ID}`,
      recordUrl: `${WORKSPACE_BASE_URL}/object/opportunity/${RECORD_ID}`,
      objectNameSingular: 'opportunity',
      recordId: RECORD_ID,
    });
  });

  it('should keep the original url as the unfurl key when Slack escaped it', () => {
    const escapedLinkUrl = `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}?a=1&amp;b=2`;
    const parsed = parseSlackRecordLink({
      linkUrl: escapedLinkUrl,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(parsed?.linkUrl).toBe(escapedLinkUrl);
    expect(parsed?.recordId).toBe(RECORD_ID);
  });

  it('should build a canonical record url without the query string', () => {
    const parsed = parseSlackRecordLink({
      linkUrl: `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}?view=${'x'.repeat(5000)}#tab`,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(parsed?.recordUrl).toBe(
      `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}`,
    );
  });

  it('should ignore links on another origin', () => {
    const parsed = parseSlackRecordLink({
      linkUrl: `https://other.twenty.com/object/person/${RECORD_ID}`,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(parsed).toBeUndefined();
  });

  it('should ignore non-record paths', () => {
    expect(
      parseSlackRecordLink({
        linkUrl: `${WORKSPACE_BASE_URL}/settings/profile`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toBeUndefined();

    expect(
      parseSlackRecordLink({
        linkUrl: `${WORKSPACE_BASE_URL}/object/person`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toBeUndefined();

    expect(
      parseSlackRecordLink({
        linkUrl: `${WORKSPACE_BASE_URL}/object/person/${RECORD_ID}/extra`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toBeUndefined();
  });

  it('should ignore record ids that are not uuids', () => {
    const parsed = parseSlackRecordLink({
      linkUrl: `${WORKSPACE_BASE_URL}/object/person/not-a-uuid`,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(parsed).toBeUndefined();
  });

  it('should ignore unparsable urls', () => {
    const parsed = parseSlackRecordLink({
      linkUrl: 'not a url',
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(parsed).toBeUndefined();
  });
});
