import { ComponentType } from 'react';

import { FilterDefinitionByEntity } from '@/ui/data/filter/types/FilterDefinitionByEntity';
import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';
import { PipelineProgress } from '~/generated/graphql';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  CardComponent: ComponentType;
  filters: FilterDefinitionByEntity<PipelineProgress>[];
  sorts: SortDefinition[];
};
