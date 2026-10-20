import { isDefined } from 'twenty-shared/utils';

export type FilterQuoteCharacter = '"' | "'";

// Quotes only open at a value start, so the apostrophe in an unquoted O'Brien stays literal
const VALUE_START_CHARACTERS = [':', '[', ','];

export const getOpenQuoteAfterCharacter = ({
  character,
  previousCharacter,
  openQuote,
}: {
  character: string;
  previousCharacter: string | undefined;
  openQuote: FilterQuoteCharacter | null;
}): FilterQuoteCharacter | null => {
  if (isDefined(openQuote)) {
    return character === openQuote ? null : openQuote;
  }

  if (
    (character === '"' || character === "'") &&
    isDefined(previousCharacter) &&
    VALUE_START_CHARACTERS.includes(previousCharacter)
  ) {
    return character;
  }

  return null;
};
