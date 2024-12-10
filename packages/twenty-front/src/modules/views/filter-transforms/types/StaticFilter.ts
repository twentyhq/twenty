import { FilterBase } from '@/views/filter-transforms/types/FilterBase';

type StaticDateFilter = FilterBase<
  'DATE',
  | Date
  | {
      start: Date;
      end: Date;
    }
>;

type StaticRelationFilter = FilterBase<'RELATION', string[]>;

export type StaticFilter = StaticDateFilter | StaticRelationFilter;
