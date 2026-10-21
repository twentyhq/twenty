const ICON_KEY_WORD_BOUNDARY = /[A-Z]/g;

export const getIconPickerLabel = (iconKey: string) =>
  iconKey.replace(ICON_KEY_WORD_BOUNDARY, (letter) => ` ${letter}`).trim();
