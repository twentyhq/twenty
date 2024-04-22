const metadataLabelValidationPattern = /^[^0-9].*$/;

export const validateMetadataLabel = (value: string) =>
  !!value.match(metadataLabelValidationPattern);
