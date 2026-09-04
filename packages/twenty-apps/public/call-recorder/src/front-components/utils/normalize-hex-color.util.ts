const SHORT_HEX_PATTERN = /^#[0-9a-f]{3}$/;
const LONG_HEX_PATTERN = /^#[0-9a-f]{6}$/;

export const normalizeHexColor = (value: string): string | undefined => {
  const normalizedValue = value.trim().toLowerCase();

  if (SHORT_HEX_PATTERN.test(normalizedValue)) {
    return `#${normalizedValue
      .slice(1)
      .split('')
      .map((character) => `${character}${character}`)
      .join('')}`;
  }

  return LONG_HEX_PATTERN.test(normalizedValue) ? normalizedValue : undefined;
};
