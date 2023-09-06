import { IconCalendarEvent, IconCurrencyDollar } from '@/ui/icon/index';
import { SortType } from '@/ui/view-bar/types/interface';
import { PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By } from '~/generated/graphql';

export const opportunitiesSorts = [
  {
    key: 'createdAt',
    label: 'Creation',
    Icon: IconCalendarEvent,
  },
  {
    key: 'amount',
    label: 'Amount',
    Icon: IconCurrencyDollar,
  },
  {
    key: 'closeDate',
    label: 'Expected close date',
    Icon: IconCalendarEvent,
  },
] satisfies Array<SortType<PipelineProgresses_Order_By>>;
