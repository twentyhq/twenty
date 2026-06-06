import { type SelectOptionMeta } from 'src/types/select-option-meta.type';

export const buildSelectOptions = (
  meta: readonly SelectOptionMeta[],
  ids: Record<string, string>,
) =>
  meta.map(({ key, value, label, color, position }) => ({
    id: ids[key],
    value,
    label,
    color,
    position,
  }));
