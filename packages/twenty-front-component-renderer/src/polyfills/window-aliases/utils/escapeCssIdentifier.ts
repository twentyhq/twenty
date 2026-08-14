export const escapeCssIdentifier = (value: unknown): string => {
  const stringValue = String(value);
  const firstCodeUnit = stringValue.charCodeAt(0);
  let escapedIdentifier = '';

  for (let index = 0; index < stringValue.length; index++) {
    const codeUnit = stringValue.charCodeAt(index);

    if (codeUnit === 0x0000) {
      escapedIdentifier += '�';
      continue;
    }

    if (
      (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
      codeUnit === 0x007f ||
      (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (index === 1 &&
        codeUnit >= 0x0030 &&
        codeUnit <= 0x0039 &&
        firstCodeUnit === 0x002d)
    ) {
      escapedIdentifier += `\\${codeUnit.toString(16)} `;
      continue;
    }

    if (index === 0 && stringValue.length === 1 && codeUnit === 0x002d) {
      escapedIdentifier += `\\${stringValue.charAt(index)}`;
      continue;
    }

    if (
      codeUnit >= 0x0080 ||
      codeUnit === 0x002d ||
      codeUnit === 0x005f ||
      (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
      (codeUnit >= 0x0061 && codeUnit <= 0x007a)
    ) {
      escapedIdentifier += stringValue.charAt(index);
      continue;
    }

    escapedIdentifier += `\\${stringValue.charAt(index)}`;
  }

  return escapedIdentifier;
};
