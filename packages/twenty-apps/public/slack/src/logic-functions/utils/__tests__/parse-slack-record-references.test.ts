import { describe, expect, it } from 'vitest';

import { parseSlackRecordReferences } from 'src/logic-functions/utils/parse-slack-record-references';

const BASE_URL = 'https://acme.twenty.com';
const OPPORTUNITY_ID = '20202020-89ab-4cde-8f01-234567890abc';
const COMPANY_ID = '20202020-1234-4abc-9def-567890abcdef';

describe('parseSlackRecordReferences', () => {
  it('should extract a record reference from a markdown record link', () => {
    const references = parseSlackRecordReferences({
      responseText: `Closed [Acme deal](${BASE_URL}/object/opportunity/${OPPORTUNITY_ID}) today.`,
      workspaceBaseUrl: BASE_URL,
    });

    expect(references).toEqual([
      {
        objectNameSingular: 'opportunity',
        recordId: OPPORTUNITY_ID,
        recordName: 'Acme deal',
        recordUrl: `${BASE_URL}/object/opportunity/${OPPORTUNITY_ID}`,
      },
    ]);
  });

  it('should keep references in order of first appearance and dedupe repeats', () => {
    const responseText = [
      `[Acme deal](${BASE_URL}/object/opportunity/${OPPORTUNITY_ID})`,
      `[Acme Corp](${BASE_URL}/object/company/${COMPANY_ID})`,
      `[Acme deal again](${BASE_URL}/object/opportunity/${OPPORTUNITY_ID})`,
    ].join(' and ');

    const references = parseSlackRecordReferences({
      responseText,
      workspaceBaseUrl: BASE_URL,
    });

    expect(references.map((reference) => reference.recordId)).toEqual([
      OPPORTUNITY_ID,
      COMPANY_ID,
    ]);
    expect(references[0].recordName).toBe('Acme deal');
  });

  it('should ignore links pointing outside the workspace', () => {
    const references = parseSlackRecordReferences({
      responseText: `See [Acme](https://other.example.com/object/company/${COMPANY_ID}).`,
      workspaceBaseUrl: BASE_URL,
    });

    expect(references).toEqual([]);
  });

  it('should ignore workspace links that are not record pages', () => {
    const references = parseSlackRecordReferences({
      responseText: `See [settings](${BASE_URL}/settings/accounts) and [list](${BASE_URL}/object/company/not-a-uuid).`,
      workspaceBaseUrl: BASE_URL,
    });

    expect(references).toEqual([]);
  });

  it('should return nothing when the workspace URL is unknown', () => {
    const references = parseSlackRecordReferences({
      responseText: `[Acme](${BASE_URL}/object/company/${COMPANY_ID})`,
      workspaceBaseUrl: undefined,
    });

    expect(references).toEqual([]);
  });
});
