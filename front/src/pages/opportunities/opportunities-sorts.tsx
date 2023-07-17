import { SortType } from '@/ui/filter-n-sort/types/interface';
import { IconCalendarEvent } from '@/ui/icon/index';
import { PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By } from '~/generated/graphql';

export const availableSorts = [
  {
    key: 'amount',
    label: 'Amount',
    icon: <IconCalendarEvent size={16} />,
  },
] satisfies Array<SortType<PipelineProgresses_Order_By>>;
