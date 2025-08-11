import { type KeyOfCompositeField } from '@/object-record/spreadsheet-import/types/KeyOfCompositeField';

export type CompositeFieldLabels<T> = {
  [key in `${KeyOfCompositeField<T>}Label`]: string;
};
