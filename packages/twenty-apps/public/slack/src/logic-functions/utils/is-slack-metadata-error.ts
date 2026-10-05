import { isNonEmptyString } from '@sniptt/guards';

// covers invalid_metadata_format, invalid_metadata_schema, metadata_too_large
// and error_processing_metadata
export const isSlackMetadataError = (errorCode: string | undefined): boolean =>
  isNonEmptyString(errorCode) && errorCode.includes('metadata');
