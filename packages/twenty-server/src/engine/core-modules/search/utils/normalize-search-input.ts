const PHONE_FORMATTING_CHARS = /[().\-\s]/g;
const LOOKS_LIKE_PHONE = /^[+\d()\-.\s]+$/;
const MIN_PHONE_DIGITS = 3;

export const normalizeSearchInput = (searchInput: string): string => {
  const trimmed = searchInput.trim();

  if (!trimmed) {
    return trimmed;
  }

  // If the input consists only of digits and phone formatting characters
  // (+, parentheses, dashes, dots, spaces), strip the formatting
  if (LOOKS_LIKE_PHONE.test(trimmed)) {
    const stripped = trimmed.replace(PHONE_FORMATTING_CHARS, '');
    const digitCount = (stripped.match(/\d/g) || []).length;

    if (digitCount >= MIN_PHONE_DIGITS) {
      return stripped;
    }
  }

  return trimmed;
};
