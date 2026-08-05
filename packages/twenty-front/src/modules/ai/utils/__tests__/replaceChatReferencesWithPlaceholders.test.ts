import { getChatReferencePlaceholder } from '@/ai/utils/getChatReferencePlaceholder';
import { replaceChatReferencesWithPlaceholders } from '@/ai/utils/replaceChatReferencesWithPlaceholders';

describe('replaceChatReferencesWithPlaceholders', () => {
  it('should leave text without references untouched', () => {
    expect(
      replaceChatReferencesWithPlaceholders('Which company should we contact?'),
    ).toEqual({
      textWithPlaceholders: 'Which company should we contact?',
      references: [],
    });
  });

  it('should replace a reference with its placeholder', () => {
    const { textWithPlaceholders, references } =
      replaceChatReferencesWithPlaceholders(
        'Open [[object:partner:Partners[[/object]] to start',
      );

    expect(textWithPlaceholders).toBe(
      `Open ${getChatReferencePlaceholder(0)} to start`,
    );
    expect(references).toHaveLength(1);
    expect(references[0].displayName).toBe('Partners');
  });

  it('should keep display names containing a url out of the markdown', () => {
    const { textWithPlaceholders, references } =
      replaceChatReferencesWithPlaceholders(
        'Open [[object:company:Acme www.acme.com[[/object]] now',
      );

    expect(textWithPlaceholders).toBe(
      `Open ${getChatReferencePlaceholder(0)} now`,
    );
    expect(references[0].displayName).toBe('Acme www.acme.com');
  });

  it('should keep display names containing an email out of the markdown', () => {
    const { textWithPlaceholders, references } =
      replaceChatReferencesWithPlaceholders(
        'Mail [[record:person:11111111-1111-1111-1111-111111111111:john@acme.com[[/record]] now',
      );

    expect(textWithPlaceholders).toBe(
      `Mail ${getChatReferencePlaceholder(0)} now`,
    );
    expect(references[0].displayName).toBe('john@acme.com');
  });

  it('should number adjacent references in order', () => {
    const { textWithPlaceholders, references } =
      replaceChatReferencesWithPlaceholders(
        '[[object:partner:Partners[[/object]][[object:company:Companies[[/object]]',
      );

    expect(textWithPlaceholders).toBe(
      `${getChatReferencePlaceholder(0)}${getChatReferencePlaceholder(1)}`,
    );
    expect(references.map((reference) => reference.displayName)).toEqual([
      'Partners',
      'Companies',
    ]);
  });

  it('should leave an unclosed reference as raw text', () => {
    expect(
      replaceChatReferencesWithPlaceholders('Open [[object:partner:Partners'),
    ).toEqual({
      textWithPlaceholders: 'Open [[object:partner:Partners',
      references: [],
    });
  });
});
