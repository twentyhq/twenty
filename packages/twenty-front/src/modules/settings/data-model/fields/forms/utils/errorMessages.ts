export enum errors {
  LabelNotUnique = 'LABEL_NOT_UNIQUE',
  LabelNotFormattable = 'LABEL_NOT_FORMATTABLE',
  LabelEmpty = 'LABEL_EMPTY',
  LabelUnsupportedSpecialCharacters = 'LABEL_UNSUPPORTED_SPECIAL_CHARACTER',
}

export const getErrorMessageFromError = (error?: string) => {
  switch (error) {
    case errors.LabelEmpty:
      return 'Name cannot be empty.';
    case errors.LabelNotFormattable:
      return 'Name should start with a letter.';
    case errors.LabelNotUnique:
      return 'This name is already used.';
    case errors.LabelUnsupportedSpecialCharacters:
      return 'Name cannot contain special characters.';
    default:
      return '';
  }
};
