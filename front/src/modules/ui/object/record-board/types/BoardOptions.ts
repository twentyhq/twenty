import { ComponentType } from 'react';

import { Opportunity } from '@/pipeline/types/Opportunity';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  CardComponent: ComponentType;
  filterDefinitions: FilterDefinitionByEntity<Opportunity>[];
  sortDefinitions: SortDefinition[];
};
