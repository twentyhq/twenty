const FORMULA_FORM_KEYS = ['formulaCurrencyCode', 'formulaEvaluation'];

export const getFieldMetadataItemInputKey = (formKey: string): string =>
  FORMULA_FORM_KEYS.includes(formKey) ? 'formula' : formKey;
