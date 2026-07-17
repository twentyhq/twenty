import {
  buildRecordReferenceToken,
  extractRecordReferences,
  RECORD_REFERENCE_PLACEHOLDER_REGEX,
} from '@/ai/utils/extractRecordReferences';

const countPlaceholders = (text: string) =>
  text.match(RECORD_REFERENCE_PLACEHOLDER_REGEX)?.length ?? 0;

const replacePlaceholdersWith = (text: string, token: string) =>
  text.replace(RECORD_REFERENCE_PLACEHOLDER_REGEX, token);

const hasNoRawTokens = (text: string) =>
  expect(text).not.toContain('[[record:');

describe('extractRecordReferences', () => {
  it('extracts a simple reference and replaces it with a placeholder', () => {
    const { sanitizedText, references } = extractRecordReferences(
      'owned by [[record:engineer:cf1ca169-ac22-4f5f-afd5-18a11b48c133:ijreilly]] today',
    );

    expect(references).toEqual([
      {
        objectNameSingular: 'engineer',
        recordId: 'cf1ca169-ac22-4f5f-afd5-18a11b48c133',
        displayName: 'ijreilly',
      },
    ]);
    hasNoRawTokens(sanitizedText);
    expect(countPlaceholders(sanitizedText)).toBe(1);
    expect(replacePlaceholdersWith(sanitizedText, 'X')).toBe(
      'owned by X today',
    );
  });

  it('keeps a display name that contains backticks in a single reference', () => {
    const { references } = extractRecordReferences(
      '[[record:issue:6cc5c91e-5b10-42ce-aed2-4abb05b89b42:Workflow DATABASE_EVENT trigger ignores watched fields on `upserted` events (logic-function path)]]',
    );

    expect(references).toHaveLength(1);
    expect(references[0].displayName).toBe(
      'Workflow DATABASE_EVENT trigger ignores watched fields on `upserted` events (logic-function path)',
    );
  });

  it('keeps a display name that contains square brackets', () => {
    const { references } = extractRecordReferences(
      '[[record:issue:8c238767-941b-4f58-9246-0bf9833f7436:[Billing for Self-hosts] Tie enterprise key to serverId]]',
    );

    expect(references).toHaveLength(1);
    expect(references[0].displayName).toBe(
      '[Billing for Self-hosts] Tie enterprise key to serverId',
    );
  });

  it('extracts every reference from the reported multi-reference message', () => {
    const text =
      "I don't see any active initiatives owned by [[record:engineer:cf1ca169-ac22-4f5f-afd5-18a11b48c133:ijreilly]], but I do see open assigned/authored issues. For the sync, should I frame next week's plan around finishing [[record:issue:6cc5c91e-5b10-42ce-aed2-4abb05b89b42:Workflow DATABASE_EVENT trigger ignores watched fields on `upserted` events (logic-function path)]], handling [[record:issue:42d9d653-ab2b-4a6b-b81c-40c19ce876ee:Attachments should not be creatable if they are not editable in the UI]], and continuing [[record:issue:8c238767-941b-4f58-9246-0bf9833f7436:[Billing for Self-hosts] Tie enterprise key to serverId]]?";

    const { sanitizedText, references } = extractRecordReferences(text);

    expect(references).toHaveLength(4);
    hasNoRawTokens(sanitizedText);
    expect(countPlaceholders(sanitizedText)).toBe(4);
  });

  it('extracts a reference with an empty display name', () => {
    const { sanitizedText, references } = extractRecordReferences(
      'see [[record:person:cf1ca169-ac22-4f5f-afd5-18a11b48c133:]] here',
    );

    expect(references).toEqual([
      {
        objectNameSingular: 'person',
        recordId: 'cf1ca169-ac22-4f5f-afd5-18a11b48c133',
        displayName: '',
      },
    ]);
    expect(countPlaceholders(sanitizedText)).toBe(1);
  });

  it('leaves text without references untouched', () => {
    const text =
      'Just a normal answer with `code` and [a link](https://x.com).';
    const { sanitizedText, references } = extractRecordReferences(text);

    expect(references).toEqual([]);
    expect(sanitizedText).toBe(text);
  });

  it('round-trips a reference back to its original token', () => {
    const reference = {
      objectNameSingular: 'issue',
      recordId: '8c238767-941b-4f58-9246-0bf9833f7436',
      displayName: '[Billing for Self-hosts] Tie enterprise key to serverId',
    };

    expect(buildRecordReferenceToken(reference)).toBe(
      '[[record:issue:8c238767-941b-4f58-9246-0bf9833f7436:[Billing for Self-hosts] Tie enterprise key to serverId]]',
    );
  });
});
