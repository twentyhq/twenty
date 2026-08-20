const NULL_REPLACEMENT_CHARACTER = '�';

const isControlCodeUnit = (codeUnit: number): boolean =>
  (codeUnit >= 0x0001 && codeUnit <= 0x001f) || codeUnit === 0x007f;

const isAsciiDigit = (character: string): boolean =>
  character >= '0' && character <= '9';

const isAsciiLetter = (character: string): boolean =>
  (character >= 'A' && character <= 'Z') ||
  (character >= 'a' && character <= 'z');

const isSafeIdentifierCharacter = (character: string): boolean =>
  character.charCodeAt(0) >= 0x0080 ||
  character === '-' ||
  character === '_' ||
  isAsciiDigit(character) ||
  isAsciiLetter(character);

const escapeAsHexCodePoint = (character: string): string =>
  `\\${character.charCodeAt(0).toString(16)} `;

export const escapeCssIdentifier = (value: unknown): string => {
  const identifier = String(value);
  const isLoneHyphen = identifier === '-';
  const startsWithHyphen = identifier.startsWith('-');
  let escapedIdentifier = '';

  for (let index = 0; index < identifier.length; index++) {
    const character = identifier.charAt(index);
    const codeUnit = identifier.charCodeAt(index);

    if (codeUnit === 0x0000) {
      escapedIdentifier += NULL_REPLACEMENT_CHARACTER;
      continue;
    }

    if (
      isControlCodeUnit(codeUnit) ||
      (index === 0 && isAsciiDigit(character)) ||
      (index === 1 && startsWithHyphen && isAsciiDigit(character))
    ) {
      escapedIdentifier += escapeAsHexCodePoint(character);
      continue;
    }

    if (isLoneHyphen || !isSafeIdentifierCharacter(character)) {
      escapedIdentifier += `\\${character}`;
      continue;
    }

    escapedIdentifier += character;
  }

  return escapedIdentifier;
};
