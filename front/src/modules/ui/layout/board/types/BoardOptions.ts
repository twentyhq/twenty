import { ComponentType } from 'react';

import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { PipelineProgress } from '~/generated/graphql';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  CardComponent: ComponentType;
  filterDefinitions: FilterDefinitionByEntity<PipelineProgress>[];
  sortDefinitions: SortDefinition[];
};
