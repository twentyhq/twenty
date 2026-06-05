type CompactConfig = {
  stripWhenNullish?: string[];
  stripWhenFalse?: string[];
};

export const compactMetadataOutput = (
  metadata: Record<string, unknown>,
  config: CompactConfig,
): Record<string, unknown> => {
  const result = { ...metadata };

  for (const key of config.stripWhenNullish ?? []) {
    if (result[key] === null || result[key] === undefined) {
      delete result[key];
    }
  }

  for (const key of config.stripWhenFalse ?? []) {
    if (result[key] === false) {
      delete result[key];
    }
  }

  return result;
};
