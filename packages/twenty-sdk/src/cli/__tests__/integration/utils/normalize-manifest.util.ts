// Loose type for JSON manifest imports where enum values are inferred as strings
type JsonManifestInput = {
  logicFunctions?: Array<{
    builtHandlerChecksum?: string | null;
    [key: string]: unknown;
  }>;
  frontComponents?: Array<{
    builtComponentChecksum?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

// Replace dynamic checksum values with a placeholder for consistent comparisons
export const normalizeManifestForComparison = <T extends JsonManifestInput>(
  manifest: T,
): T => ({
  ...manifest,
  logicFunctions: manifest.logicFunctions?.map((fn) => ({
    ...fn,
    builtHandlerChecksum: fn.builtHandlerChecksum ? '[checksum]' : null,
  })),
  frontComponents: manifest.frontComponents?.map((component) => ({
    ...component,
    builtComponentChecksum: component.builtComponentChecksum
      ? '[checksum]'
      : '',
  })),
});
