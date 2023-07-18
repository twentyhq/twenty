import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import { SortType } from '@/ui/filter-n-sort/types/interface';
import { PipelineProgress } from '~/generated/graphql';
import { PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By } from '~/generated/graphql';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  cardComponent: React.ReactNode;
  filters: FilterDefinitionByEntity<PipelineProgress>[];
  sorts: Array<SortType<PipelineProgresses_Order_By>>;
};
