import { RelativeDateDirection } from '@/ui/input/components/internal/date/types/RelativeDateDirection';
import { RelativeDateUnit } from '@/ui/input/components/internal/date/types/RelativeDateUnit';

export interface RelativeDateFilterValue {
  type: 'relative';
  direction: RelativeDateDirection;
  unit: RelativeDateUnit;
  amount: number;
}

export interface AbsoluteDateFilterValue {
  type: 'absolute';
  isoString: string;
}

export type DateFilterValue = RelativeDateFilterValue | AbsoluteDateFilterValue;
