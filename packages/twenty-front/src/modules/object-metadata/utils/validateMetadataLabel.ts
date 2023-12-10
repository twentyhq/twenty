const metadataLabelValidationPattern = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

export const validateMetadataLabel = (value: string) =>
  !!value.match(metadataLabelValidationPattern);
