import { ComponentType } from 'react';

import { FilterDefinitionByEntity } from '@/ui/Data/View Bar/types/FilterDefinitionByEntity';
import { SortDefinition } from '@/ui/Data/View Bar/types/SortDefinition';
import { PipelineProgress } from '~/generated/graphql';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  CardComponent: ComponentType;
  filters: FilterDefinitionByEntity<PipelineProgress>[];
  sorts: SortDefinition[];
};
