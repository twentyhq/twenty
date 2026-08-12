import { describe, expect, it } from 'vitest';

import { extractSlackRecordLinks } from 'src/logic-functions/utils/extract-slack-record-links';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';

describe('extractSlackRecordLinks', () => {
  it('should extract a record link written as Markdown', () => {
    expect(
      extractSlackRecordLinks({
        responseText: `Created [ACME](${WORKSPACE_BASE_URL}/object/company/c-1).`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toEqual([
      {
        objectNameSingular: 'company',
        recordId: 'c-1',
        recordUrl: `${WORKSPACE_BASE_URL}/object/company/c-1`,
        linkLabel: 'ACME',
      },
    ]);
  });

  it('should extract every distinct record of a list answer', () => {
    const responseText = [
      `- [ACME](${WORKSPACE_BASE_URL}/object/company/c-1) — $12,500`,
      `- [Globex](${WORKSPACE_BASE_URL}/object/company/c-2) — $8,000`,
    ].join('\n');

    expect(
      extractSlackRecordLinks({
        responseText,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }).map(({ recordId }) => recordId),
    ).toEqual(['c-1', 'c-2']);
  });

  it('should count a record linked twice as a single record', () => {
    const responseText = [
      `[ACME](${WORKSPACE_BASE_URL}/object/company/c-1) is the account.`,
      `Its owner also follows [ACME](${WORKSPACE_BASE_URL}/object/company/c-1).`,
    ].join(' ');

    expect(
      extractSlackRecordLinks({
        responseText,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toHaveLength(1);
  });

  it('should ignore links pointing outside the workspace', () => {
    expect(
      extractSlackRecordLinks({
        responseText: `See [the docs](https://docs.twenty.com/object/company/c-1).`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toEqual([]);
  });

  it('should ignore workspace links that are not record pages', () => {
    expect(
      extractSlackRecordLinks({
        responseText: `Open [settings](${WORKSPACE_BASE_URL}/settings/profile).`,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toEqual([]);
  });

  it('should return nothing when the workspace URL could not be resolved', () => {
    expect(
      extractSlackRecordLinks({
        responseText: `Created [ACME](${WORKSPACE_BASE_URL}/object/company/c-1).`,
        workspaceBaseUrl: undefined,
      }),
    ).toEqual([]);
  });
});
