const ZERO_WIDTH_NON_JOINER = '\u200C';

// Password managers autofill inputs whose placeholder reads like a name field
export const addCharactersToAvoidPasswordManagers = (placeholder: string) =>
  `${placeholder.slice(0, 1)}${ZERO_WIDTH_NON_JOINER}${ZERO_WIDTH_NON_JOINER}${placeholder.slice(1)}`;
