// Backs the sandbox CSS.escape: https://drafts.csswg.org/cssom/#serialize-an-identifier

const NULL_CODE_UNIT = 0x0000;
const NULL_REPLACEMENT_CHARACTER = '�';

const isControlCodeUnit = (codeUnit: number): boolean =>
  (codeUnit >= 0x0001 && codeUnit <= 0x001f) || codeUnit === 0x007f;

const isNonAsciiCodeUnit = (codeUnit: number): boolean => codeUnit >= 0x0080;

const isAsciiDigit = (character: string): boolean =>
  character >= '0' && character <= '9';

const isAsciiLetter = (character: string): boolean =>
  (character >= 'A' && character <= 'Z') ||
  (character >= 'a' && character <= 'z');

const isSafeIdentifierCharacter = (character: string): boolean =>
  isNonAsciiCodeUnit(character.charCodeAt(0)) ||
  character === '-' ||
  character === '_' ||
  isAsciiDigit(character) ||
  isAsciiLetter(character);

const escapeAsHexCodePoint = (character: string): string =>
  `\\${character.charCodeAt(0).toString(16)} `;

const escapeWithBackslash = (character: string): string => `\\${character}`;

export const escapeCssIdentifier = (value: unknown): string => {
  const identifier = String(value);
  const isLoneHyphen = identifier === '-';
  const startsWithHyphen = identifier.startsWith('-');
  let escapedIdentifier = '';

  for (let index = 0; index < identifier.length; index++) {
    const character = identifier.charAt(index);
    const codeUnit = identifier.charCodeAt(index);

    if (codeUnit === NULL_CODE_UNIT) {
      escapedIdentifier += NULL_REPLACEMENT_CHARACTER;
      continue;
    }

    const isLeadingDigit = index === 0 && isAsciiDigit(character);
    const isDigitAfterLeadingHyphen =
      index === 1 && startsWithHyphen && isAsciiDigit(character);

    if (
      isControlCodeUnit(codeUnit) ||
      isLeadingDigit ||
      isDigitAfterLeadingHyphen
    ) {
      escapedIdentifier += escapeAsHexCodePoint(character);
      continue;
    }

    if (isLoneHyphen || !isSafeIdentifierCharacter(character)) {
      escapedIdentifier += escapeWithBackslash(character);
      continue;
    }

    escapedIdentifier += character;
  }

  return escapedIdentifier;
};
