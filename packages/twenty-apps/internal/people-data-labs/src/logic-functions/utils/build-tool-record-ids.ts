import { type EnrichToolInput } from 'src/types/enrich-tool-input';

export const buildToolRecordIds = (input: EnrichToolInput): string[] => {
  const ids = [
    ...(input.recordIds ?? []),
    ...(input.recordId !== undefined ? [input.recordId] : []),
  ];

  return Array.from(new Set(ids));
};
