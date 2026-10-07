const ASCII_UPPERCASE_LETTER_PATTERN = /[A-Z]/g;

export const lowercaseAsciiLetters = (value: string): string =>
  value.replace(ASCII_UPPERCASE_LETTER_PATTERN, (uppercaseLetter) =>
    uppercaseLetter.toLowerCase(),
  );
