export type SharpFactory = typeof import('sharp').default;

export const loadSharp = async (): Promise<SharpFactory> => {
  const sharpModule = await import('sharp');

  return ((sharpModule.default as unknown as { default?: SharpFactory })
    .default ?? sharpModule.default) as SharpFactory;
};
