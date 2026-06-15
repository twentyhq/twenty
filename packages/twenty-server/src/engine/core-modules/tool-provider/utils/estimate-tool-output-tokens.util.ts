const CHARS_PER_TOKEN = 4;

export const estimateToolOutputTokens = (output: unknown): number => {
  if (output === undefined || output === null) {
    return 0;
  }

  let serialized: string;

  try {
    serialized =
      typeof output === 'string' ? output : (JSON.stringify(output) ?? '');
  } catch {
    return 0;
  }

  return Math.ceil(serialized.length / CHARS_PER_TOKEN);
};
