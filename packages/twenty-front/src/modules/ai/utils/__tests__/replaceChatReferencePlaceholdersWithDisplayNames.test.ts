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

  it('should keep a placeholder without a matching reference', () => {
    expect(
      replaceChatReferencePlaceholdersWithDisplayNames({
        text: `Open ${getChatReferencePlaceholder(3)}`,
        references: [],
      }),
    ).toBe(`Open ${getChatReferencePlaceholder(3)}`);
  });
});
