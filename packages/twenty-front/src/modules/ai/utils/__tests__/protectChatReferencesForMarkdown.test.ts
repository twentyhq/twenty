import { protectChatReferencesForMarkdown } from '@/ai/utils/protectChatReferencesForMarkdown';

describe('protectChatReferencesForMarkdown', () => {
  it('should leave plain text unchanged', () => {
    expect(
      protectChatReferencesForMarkdown('Which company should we contact?'),
    ).toBe('Which company should we contact?');
  });

  it('should rewrite legacy refs to the tagged format', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toBe(
      'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] next',
    );
  });

  it('should escape backticks in labels and close with the tag', () => {
    expect(
      protectChatReferencesForMarkdown(
        'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step[[/record]]',
      ),
    ).toBe(
      'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow \\`UPDATE\\_RECORD\\` step[[/record]]',
    );
  });

  it('should escape square brackets and ]] inside labels', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###[[/record]]',
      ),
    ).toBe(
      'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:\\[test\\] \\]\\] \\[test\\] \\[test\\] \\#\\#\\#[[/record]]',
    );
  });

  it('should leave colons in labels unchanged', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane[[/record]]',
      ),
    ).toBe(
      'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane[[/record]]',
    );
  });

  it('should escape an object label without touching its name', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Open [[object:partner:Partners (EMEA)[[/object]]',
      ),
    ).toBe('Open [[object:partner:Partners \\(EMEA\\)[[/object]]');
  });

  it('should escape a field label without touching its id', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[field:33333333-3333-3333-3333-333333333333:Next step[[/field]] field',
      ),
    ).toBe(
      'The [[field:33333333-3333-3333-3333-333333333333:Next step[[/field]] field',
    );
  });

  it('should escape a view label without touching its id', () => {
    expect(
      protectChatReferencesForMarkdown(
        'See [[view:44444444-4444-4444-4444-444444444444:Q1 - pipeline[[/view]]',
      ),
    ).toBe(
      'See [[view:44444444-4444-4444-4444-444444444444:Q1 \\- pipeline[[/view]]',
    );
  });

  it('should drop a surplus bracket added after the closing tag', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Created [[object:opportunity:Opportunities[[/object]]].',
      ),
    ).toBe('Created [[object:opportunity:Opportunities[[/object]].');
  });

  it('should drop the extra brackets of an over-wrapped reference', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Created [[[object:opportunity:Opportunities[[/object]]]] now',
      ),
    ).toBe('Created [[object:opportunity:Opportunities[[/object]] now');
  });

  it('should rewrite every kind in a mixed string', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[view:44444444-4444-4444-4444-444444444444:Pipeline[[/view]] view of [[object:partner:Partners[[/object]] groups [[record:person:11111111-1111-1111-1111-111111111111:Alice]] by [[field:33333333-3333-3333-3333-333333333333:Stage[[/field]]',
      ),
    ).toBe(
      'The [[view:44444444-4444-4444-4444-444444444444:Pipeline[[/view]] view of [[object:partner:Partners[[/object]] groups [[record:person:11111111-1111-1111-1111-111111111111:Alice[[/record]] by [[field:33333333-3333-3333-3333-333333333333:Stage[[/field]]',
    );
  });
});
