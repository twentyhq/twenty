import type { ComponentType, Context } from 'react';

import { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
import { SortType } from '@/ui/view-bar/types/interface';
import { PipelineProgress } from '~/generated/graphql';
import { PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By } from '~/generated/graphql';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  CardComponent: ComponentType<{ scopeContext: Context<string | null> }>;
  filters: FilterDefinitionByEntity<PipelineProgress>[];
  sorts: Array<SortType<PipelineProgresses_Order_By>>;
};
