import { t } from '@lingui/core/macro';

export enum errors {
  LabelNotUnique = 'LABEL_NOT_UNIQUE',
  LabelNotFormattable = 'LABEL_NOT_FORMATTABLE',
  LabelEmpty = 'LABEL_EMPTY',
}

export const getErrorMessageFromError = (error?: string) => {
  switch (error) {
    case errors.LabelEmpty:
      return t`Name cannot be empty.`;
    case errors.LabelNotFormattable:
      return t`Name should start with a letter.`;
    case errors.LabelNotUnique:
      return t`This name is already used.`;
    default:
      return '';
  }
};
