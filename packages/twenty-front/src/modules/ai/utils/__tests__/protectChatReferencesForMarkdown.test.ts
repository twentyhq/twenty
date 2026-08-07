import { protectChatReferencesForMarkdown } from '@/ai/utils/protectChatReferencesForMarkdown';

describe('protectChatReferencesForMarkdown', () => {
  it('should leave plain text unchanged', () => {
    expect(
      protectChatReferencesForMarkdown('Which company should we contact?'),
    ).toBe('Which company should we contact?');
  });

  it('should leave a reference with a plain label unchanged', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toBe(
      'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
    );
  });

  it('should add the record prefix to a reference written without it', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Contact [[company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toBe(
      'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
    );
  });

  it('should escape backticks in labels', () => {
    expect(
      protectChatReferencesForMarkdown(
        'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step]]',
      ),
    ).toBe(
      'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow \\`UPDATE\\_RECORD\\` step]]',
    );
  });

  it('should leave colons in labels unchanged', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]',
      ),
    ).toBe(
      'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]',
    );
  });

  it('should escape an object label without touching its name', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Open [[object:partner:Partners (EMEA)]]',
      ),
    ).toBe('Open [[object:partner:Partners \\(EMEA\\)]]');
  });

  it('should escape a field label without touching its id', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[field:33333333-3333-3333-3333-333333333333:Next step]] field',
      ),
    ).toBe(
      'The [[field:33333333-3333-3333-3333-333333333333:Next step]] field',
    );
  });

  it('should escape a view label without touching its id', () => {
    expect(
      protectChatReferencesForMarkdown(
        'See [[view:44444444-4444-4444-4444-444444444444:Q1 - pipeline]]',
      ),
    ).toBe('See [[view:44444444-4444-4444-4444-444444444444:Q1 \\- pipeline]]');
  });

  it('should leave a marker whose label contains brackets unchanged', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] name]]',
      ),
    ).toBe(
      'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] name]]',
    );
  });

  it('should leave a marker using a retired closing tag unchanged', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[field:33333333-3333-3333-3333-333333333333:Stage[[/field]] field',
      ),
    ).toBe(
      'The [[field:33333333-3333-3333-3333-333333333333:Stage[[/field]] field',
    );
  });

  it('should keep a surplus bracket added after a reference', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Created [[object:opportunity:Opportunities]]].',
      ),
    ).toBe('Created [[object:opportunity:Opportunities]]].');
  });

  it('should rewrite every kind in a mixed string', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[view:44444444-4444-4444-4444-444444444444:Pipeline]] view of [[object:partner:Partners]] groups [[person:11111111-1111-1111-1111-111111111111:Alice]] by [[field:33333333-3333-3333-3333-333333333333:Stage]]',
      ),
    ).toBe(
      'The [[view:44444444-4444-4444-4444-444444444444:Pipeline]] view of [[object:partner:Partners]] groups [[record:person:11111111-1111-1111-1111-111111111111:Alice]] by [[field:33333333-3333-3333-3333-333333333333:Stage]]',
    );
  });
});
