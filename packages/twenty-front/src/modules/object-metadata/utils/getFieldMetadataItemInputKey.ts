export const getFieldMetadataItemInputKey = (formKey: string): string =>
  formKey === 'formulaCurrencyCode' ? 'formula' : formKey;
