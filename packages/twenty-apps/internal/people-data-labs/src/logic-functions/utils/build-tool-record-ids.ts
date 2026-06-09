import { isNonEmptyString } from '@sniptt/guards';

import { type EnrichToolInput } from 'src/types/enrich-tool-input';

export const buildToolRecordIds = (input: EnrichToolInput): string[] => {
  const ids = [
    ...(input.recordIds ?? []),
    ...(input.recordId !== undefined ? [input.recordId] : []),
  ].filter(isNonEmptyString);

  return Array.from(new Set(ids));
};
