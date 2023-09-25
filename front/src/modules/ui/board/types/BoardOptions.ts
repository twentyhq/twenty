import { ComponentType } from 'react';

import { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
import { SortDefinition } from '@/ui/view-bar/types/SortDefinition';
import { PipelineProgress } from '~/generated/graphql';

export type BoardOptions = {
  newCardComponent: React.ReactNode;
  CardComponent: ComponentType;
  filters: FilterDefinitionByEntity<PipelineProgress>[];
  sorts: SortDefinition[];
};
