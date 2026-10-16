import { type SelectValue } from '@/ui/input/components/internal/select/types';

export const getSelectOptionIdentifier = (value: SelectValue) =>
  `${typeof value}:${String(value)}`;
