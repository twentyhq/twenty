export const getFieldMetadataItemInputKey = (formKey: string): string =>
  formKey === 'formula' || formKey === 'formulaCurrencyCode'
    ? 'settings'
    : formKey;
