const metadataObjectLabelValidationPattern = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

export const validateMetadataObjectLabel = (value: string) =>
  !!value.match(metadataObjectLabelValidationPattern);
