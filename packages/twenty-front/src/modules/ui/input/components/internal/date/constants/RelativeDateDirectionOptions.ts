import { RelativeDateDirection } from '../types/RelativeDateDirection';

export const RELATIVE_DATE_DIRECTIONS: {
  value: RelativeDateDirection;
  label: string;
}[] = [
  { value: RelativeDateDirection.Past, label: 'Past' },
  { value: RelativeDateDirection.Next, label: 'Next' },
  { value: RelativeDateDirection.This, label: 'This' },
];
