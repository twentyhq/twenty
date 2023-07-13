import { FilterDefinitionByEntity } from '@/lib/filters-and-sorts/types/FilterDefinitionByEntity';
import { IconCalendarEvent } from '@/ui/icons/index';
import { icon } from '@/ui/themes/icon';
import { PipelineProgress } from '~/generated/graphql';

export const companyProgressFilters: FilterDefinitionByEntity<PipelineProgress>[] =
  [
    {
      field: 'closeDate',
      label: 'Close date',
      icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
      type: 'date',
    },
  ];
