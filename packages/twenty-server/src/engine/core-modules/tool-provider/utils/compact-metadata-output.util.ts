type CompactConfig = {
  stripWhenNullish?: string[];
  stripWhenFalse?: string[];
};

export const compactRecord = (
  record: Record<string, unknown>,
  config: CompactConfig,
): Record<string, unknown> => {
  const result = { ...record };

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

export const wrapInMetadataEnvelope = (
  records: Record<string, unknown>[],
  recordsKey: string,
  hoistKeys: string[] = ['workspaceId', 'applicationId'],
): Record<string, unknown> => {
  const envelope: Record<string, unknown> = {};

  if (records.length > 0) {
    for (const key of hoistKeys) {
      if (key in records[0]) {
        envelope[key] = records[0][key];
      }
    }
  }

  envelope[recordsKey] = records.map((record) => {
    const stripped = { ...record };

    for (const key of hoistKeys) {
      delete stripped[key];
    }

    return stripped;
  });

  return envelope;
};
