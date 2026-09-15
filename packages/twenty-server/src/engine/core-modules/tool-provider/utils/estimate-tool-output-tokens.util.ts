import { isDefined } from 'twenty-shared/utils';

const CHARS_PER_TOKEN = 4;

export const estimateToolOutputTokens = (output: unknown): number => {
  if (!isDefined(output)) {
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
