// Loose type for JSON manifest imports where enum values are inferred as strings
type JsonManifestInput = {
  functions?: Array<{
    builtHandlerChecksum?: string | null;
    [key: string]: unknown;
  }>;
  frontComponents?: Array<{
    builtComponentChecksum?: string | null;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

// Replace dynamic checksum values with a placeholder for consistent comparisons
export const normalizeManifestForComparison = <T extends JsonManifestInput>(
  manifest: T,
): T => ({
  ...manifest,
  functions: manifest.functions?.map((fn) => ({
    ...fn,
    builtHandlerChecksum: fn.builtHandlerChecksum ? '[checksum]' : null,
  })),
  frontComponents: manifest.frontComponents?.map((component) => ({
    ...component,
    builtComponentChecksum: component.builtComponentChecksum
      ? '[checksum]'
      : null,
  })),
  sources: {}, // removing sources for now, waiting compressed file implementation
});
