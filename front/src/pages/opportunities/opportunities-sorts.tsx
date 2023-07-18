import { SortType } from '@/ui/filter-n-sort/types/interface';
import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/icon/index';
import { PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By } from '~/generated/graphql';

export const opportunitiesSorts = [
  {
    key: 'createdAt',
    label: 'Creation',
    icon: <IconCalendarEvent size={16} />,
  },
  {
    key: 'amount',
    label: 'Amount',
    icon: <IconCurrencyDollar size={16} />,
  },
  {
    key: 'closeDate',
    label: 'Expected close date',
    icon: <IconCalendarEvent size={16} />,
  },
] satisfies Array<SortType<PipelineProgresses_Order_By>>;
