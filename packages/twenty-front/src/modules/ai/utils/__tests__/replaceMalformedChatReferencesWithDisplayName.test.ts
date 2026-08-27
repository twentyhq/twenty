import { replaceMalformedChatReferencesWithDisplayName } from '@/ai/utils/replaceMalformedChatReferencesWithDisplayName';

describe('replaceMalformedChatReferencesWithDisplayName', () => {
  it('should leave plain text unchanged', () => {
    expect(
      replaceMalformedChatReferencesWithDisplayName('Add a role field'),
    ).toBe('Add a role field');
  });

  it('should keep the display name of a field name no reference form accepts', () => {
    expect(
      replaceMalformedChatReferencesWithDisplayName(
        'add [[field:person:lead source:Lead source]] so the team can segment contacts',
      ),
    ).toBe('add Lead source so the team can segment contacts');
  });

  it('should keep the display name of every malformed reference kind', () => {
    expect(
      replaceMalformedChatReferencesWithDisplayName(
        '[[object:person:sub:People]] [[view:pipeline:Pipeline]] [[record:company:acme:Acme]]',
      ),
    ).toBe('People Pipeline Acme');
  });

  it('should leave a marker carrying no display name unchanged', () => {
    expect(
      replaceMalformedChatReferencesWithDisplayName(
        'see [[field:33333333-3333-3333-3333-333333333333]] here',
      ),
    ).toBe('see [[field:33333333-3333-3333-3333-333333333333]] here');
  });

  it('should leave an unclosed reference unchanged', () => {
    expect(
      replaceMalformedChatReferencesWithDisplayName(
        'add [[field:person:role:Role and more',
      ),
    ).toBe('add [[field:person:role:Role and more');
  });

  it('should leave a marker without a known kind unchanged', () => {
    expect(
      replaceMalformedChatReferencesWithDisplayName('see [[some note]] here'),
    ).toBe('see [[some note]] here');
  });
});
