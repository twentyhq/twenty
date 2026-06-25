import { type SelectOptionMeta } from 'src/types/select-option-meta';

export const buildAllowedValues = (
  options: readonly SelectOptionMeta[],
): Set<string> => new Set(options.map((option) => option.value));
