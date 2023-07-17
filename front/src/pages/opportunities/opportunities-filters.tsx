import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import { IconBuildingSkyscraper } from '@/ui/icon/index';
import { icon } from '@/ui/themes/icon';
import { PipelineProgress } from '~/generated/graphql';

export const opportunitiesFilters: FilterDefinitionByEntity<PipelineProgress>[] =
  [
    {
      field: 'amount',
      label: 'Amount',
      icon: (
        <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
      ),
      type: 'number',
    },
  ];
