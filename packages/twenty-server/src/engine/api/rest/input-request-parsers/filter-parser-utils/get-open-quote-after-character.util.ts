import { isDefined } from 'twenty-shared/utils';

export type FilterQuoteCharacter = '"' | "'";

// A quote only opens a string at the start of a value or array item, so an
// apostrophe inside an unquoted value (eg: O'Brien) stays a plain character
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
