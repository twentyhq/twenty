export type ModelFileLimits = {
  maxFileSizeBytes: number;
  maxTotalSizeBytes: number;
  maxFileCount: number;
  mimeTypesRequiringUrl: Set<string>;
};
