import { protectRecordReferencesForMarkdown } from '@/ai/utils/protectRecordReferencesForMarkdown';

describe('protectRecordReferencesForMarkdown', () => {
  it('should leave plain text unchanged', () => {
    expect(
      protectRecordReferencesForMarkdown('Which company should we contact?'),
    ).toBe('Which company should we contact?');
  });

  it('should rewrite legacy refs to the tagged format', () => {
    expect(
      protectRecordReferencesForMarkdown(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toBe(
      'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] next',
    );
  });

  it('should escape backticks in labels and close with the tag', () => {
    expect(
      protectRecordReferencesForMarkdown(
        'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step[[/record]]',
      ),
    ).toBe(
      'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow \\`UPDATE\\_RECORD\\` step[[/record]]',
    );
  });

  it('should escape square brackets and ]] inside labels', () => {
    expect(
      protectRecordReferencesForMarkdown(
        'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###[[/record]]',
      ),
    ).toBe(
      'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:\\[test\\] \\]\\] \\[test\\] \\[test\\] \\#\\#\\#[[/record]]',
    );
  });

  it('should leave colons in labels unchanged', () => {
    expect(
      protectRecordReferencesForMarkdown(
        'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane[[/record]]',
      ),
    ).toBe(
      'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane[[/record]]',
    );
  });
});
