import { ComponentType } from 'react';

import { FilterDefinitionByEntity } from '@/ui/object/filter/types/FilterDefinitionByEntity';
import { SortDefinition } from '@/ui/object/sort/types/SortDefinition';
import { PipelineProgress } from '~/generated/graphql';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  CardComponent: ComponentType;
  filterDefinitions: FilterDefinitionByEntity<PipelineProgress>[];
  sortDefinitions: SortDefinition[];
};
