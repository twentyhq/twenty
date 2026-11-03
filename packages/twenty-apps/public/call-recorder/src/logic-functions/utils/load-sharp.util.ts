export type SharpFactory = typeof import('sharp').default;

// Loaded on use so the native module isn't required when the manifest build
// merely imports a module that renders images.
export const loadSharp = async (): Promise<SharpFactory> => {
  const sharpModule = await import('sharp');

  return ((sharpModule.default as unknown as { default?: SharpFactory })
    .default ?? sharpModule.default) as SharpFactory;
};
