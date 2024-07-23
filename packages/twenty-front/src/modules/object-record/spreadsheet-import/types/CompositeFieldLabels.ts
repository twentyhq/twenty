import { KeyOfCompositeType } from '@/object-record/spreadsheet-import/types/KeyOfCompositeType';

export type CompositeTypeLabels<T> = {
  [key in `${KeyOfCompositeType<T>}Label`]: string;
};
