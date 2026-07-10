import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';
import { getEmailRecipientSuggestionList } from '@/activities/emails/recipients/utils/getEmailRecipientSuggestionList';

const buildSuggestion = (
  address: string,
  suggestionId?: string,
): EmailRecipientSuggestion => ({
  suggestionId: suggestionId ?? `record-${address}`,
  recipient: { address },
  label: address,
  secondaryText: '',
  avatarColorSeed: address,
});

describe('getEmailRecipientSuggestionList', () => {
  it('should drop empty, excluded and duplicate addresses while keeping order', () => {
    const suggestionList = getEmailRecipientSuggestionList({
      rankedSuggestions: [
        buildSuggestion('a@example.com'),
        buildSuggestion(''),
        buildSuggestion('b@example.com'),
        buildSuggestion('A@Example.com', 'record-duplicate'),
        buildSuggestion('c@example.com'),
      ],
      excludedRecipientKeys: ['b@example.com'],
      limit: 8,
    });

    expect(
      suggestionList.map((suggestion) => suggestion.recipient.address),
    ).toEqual(['a@example.com', 'c@example.com']);
  });

  it('should cap the list at the given limit', () => {
    const suggestionList = getEmailRecipientSuggestionList({
      rankedSuggestions: [
        buildSuggestion('a@example.com'),
        buildSuggestion('b@example.com'),
        buildSuggestion('c@example.com'),
      ],
      excludedRecipientKeys: [],
      limit: 2,
    });

    expect(suggestionList).toHaveLength(2);
  });

  it('should put the matching record row first when the typed email matches a suggestion', () => {
    const suggestionList = getEmailRecipientSuggestionList({
      rankedSuggestions: [
        buildSuggestion('other@example.com'),
        buildSuggestion('typed@example.com', 'record-typed'),
      ],
      typedEmailSuggestion: buildSuggestion('Typed@Example.com', 'typed-row'),
      excludedRecipientKeys: [],
      limit: 8,
    });

    expect(suggestionList.map((suggestion) => suggestion.suggestionId)).toEqual(
      ['record-typed', 'record-other@example.com'],
    );
  });

  it('should put the literal typed email row first when no suggestion matches', () => {
    const suggestionList = getEmailRecipientSuggestionList({
      rankedSuggestions: [buildSuggestion('other@example.com')],
      typedEmailSuggestion: buildSuggestion('typed@example.com', 'typed-row'),
      excludedRecipientKeys: [],
      limit: 8,
    });

    expect(suggestionList.map((suggestion) => suggestion.suggestionId)).toEqual(
      ['typed-row', 'record-other@example.com'],
    );
  });

  it('should not surface the typed email when it is excluded', () => {
    const suggestionList = getEmailRecipientSuggestionList({
      rankedSuggestions: [buildSuggestion('other@example.com')],
      typedEmailSuggestion: buildSuggestion('typed@example.com', 'typed-row'),
      excludedRecipientKeys: ['typed@example.com'],
      limit: 8,
    });

    expect(
      suggestionList.map((suggestion) => suggestion.recipient.address),
    ).toEqual(['other@example.com']);
  });
});
