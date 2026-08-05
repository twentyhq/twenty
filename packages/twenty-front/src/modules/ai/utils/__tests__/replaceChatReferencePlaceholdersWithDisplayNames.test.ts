import { getChatReferencePlaceholder } from '@/ai/utils/getChatReferencePlaceholder';
import { replaceChatReferencePlaceholdersWithDisplayNames } from '@/ai/utils/replaceChatReferencePlaceholdersWithDisplayNames';
import { replaceChatReferencesWithPlaceholders } from '@/ai/utils/replaceChatReferencesWithPlaceholders';

describe('replaceChatReferencePlaceholdersWithDisplayNames', () => {
  it('should put display names back', () => {
    const { textWithPlaceholders, references } =
      replaceChatReferencesWithPlaceholders(
        'Open [[object:partner:Partners[[/object]] and [[object:company:Companies[[/object]]',
      );

    expect(
      replaceChatReferencePlaceholdersWithDisplayNames({
        text: textWithPlaceholders,
        references,
      }),
    ).toBe('Open Partners and Companies');
  });

  it('should keep a placeholder whose index is out of range', () => {
    const { references } = replaceChatReferencesWithPlaceholders(
      'Open [[object:partner:Partners[[/object]]',
    );

    expect(
      replaceChatReferencePlaceholdersWithDisplayNames({
        text: `${getChatReferencePlaceholder(0)} then ${getChatReferencePlaceholder(3)}`,
        references,
      }),
    ).toBe(`Partners then ${getChatReferencePlaceholder(3)}`);
  });

  it('should leave text untouched when there is no reference', () => {
    expect(
      replaceChatReferencePlaceholdersWithDisplayNames({
        text: 'Open the partners list',
        references: [],
      }),
    ).toBe('Open the partners list');
  });
});
