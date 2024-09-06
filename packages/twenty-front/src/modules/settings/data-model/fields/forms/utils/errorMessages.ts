export enum errors {
  LabelNotUnique = 'LABEL_NOT_UNIQUE',
  LabelNotFormattable = 'LABEL_NOT_FORMATTABLE',
  LabelEmpty = 'LABEL_EMPTY',
}

export const getErrorMessageFromError = (error?: string) => {
  switch (error) {
    case errors.LabelEmpty:
      return 'O nome não pode estar vazio.';
    case errors.LabelNotFormattable:
      return 'O nome deve começar com uma letra.';
    case errors.LabelNotUnique:
      return 'Esse nome já está em uso.';
    default:
      return '';
  }
};
