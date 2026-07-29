import { describe, expect, it } from 'vitest';

import { extractTwentyRecordLinks } from 'src/logic-functions/utils/extract-twenty-record-links';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';

describe('extractTwentyRecordLinks', () => {
  it('should return the record links found in the response text', () => {
    const text = `Created [ACME](${WORKSPACE_BASE_URL}/object/company/c-1) and [John Doe](${WORKSPACE_BASE_URL}/object/person/p-1).`;

    expect(
      extractTwentyRecordLinks({ text, workspaceBaseUrl: WORKSPACE_BASE_URL }),
    ).toEqual([
      { label: 'ACME', url: `${WORKSPACE_BASE_URL}/object/company/c-1` },
      { label: 'John Doe', url: `${WORKSPACE_BASE_URL}/object/person/p-1` },
    ]);
  });

  it('should strip markdown emphasis from the link label', () => {
    const text = `Created [**ACME**](${WORKSPACE_BASE_URL}/object/company/c-1).`;

    expect(
      extractTwentyRecordLinks({ text, workspaceBaseUrl: WORKSPACE_BASE_URL }),
    ).toEqual([
      { label: 'ACME', url: `${WORKSPACE_BASE_URL}/object/company/c-1` },
    ]);
  });

  it('should skip links that do not point at a record page in this workspace', () => {
    const text = [
      `[Docs](https://docs.twenty.com/object/company/c-1)`,
      `[Settings](${WORKSPACE_BASE_URL}/settings/profile)`,
      `[ACME](${WORKSPACE_BASE_URL}/object/company/c-1)`,
    ].join(' ');

    expect(
      extractTwentyRecordLinks({ text, workspaceBaseUrl: WORKSPACE_BASE_URL }),
    ).toEqual([
      { label: 'ACME', url: `${WORKSPACE_BASE_URL}/object/company/c-1` },
    ]);
  });

  it('should deduplicate repeated links to the same record', () => {
    const text = `[ACME](${WORKSPACE_BASE_URL}/object/company/c-1) then [ACME again](${WORKSPACE_BASE_URL}/object/company/c-1)`;

    expect(
      extractTwentyRecordLinks({ text, workspaceBaseUrl: WORKSPACE_BASE_URL }),
    ).toEqual([
      { label: 'ACME', url: `${WORKSPACE_BASE_URL}/object/company/c-1` },
    ]);
  });

  it('should cap the number of returned links', () => {
    const text = Array.from(
      { length: 8 },
      (_, index) =>
        `[Company ${index}](${WORKSPACE_BASE_URL}/object/company/c-${index})`,
    ).join(' ');

    expect(
      extractTwentyRecordLinks({
        text,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
        maxLinks: 3,
      }),
    ).toHaveLength(3);
  });

  it('should return nothing when the workspace base URL is unknown', () => {
    const text = `[ACME](${WORKSPACE_BASE_URL}/object/company/c-1)`;

    expect(
      extractTwentyRecordLinks({ text, workspaceBaseUrl: undefined }),
    ).toEqual([]);
  });
});
