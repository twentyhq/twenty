import { computeMetadataNameFromLabel as computeMetadataNameFromLabelCore } from 'twenty-shared/metadata';

// Frontend-specific wrapper that returns empty string on error instead of throwing
// This is needed for form validation and UI components that prefer graceful degradation
export const computeMetadataNameFromLabel = (label: string): string => {
  try {
    return computeMetadataNameFromLabelCore({ label });
  } catch {
    return '';
  }
};
