import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export type CalendarEventsPageType = {
  pageNumber: number;
  hasNextPage: boolean;
};

export const calendarEventsPageComponentState =
  createComponentState<CalendarEventsPageType>({
    key: 'calendarEventsPageComponentState',
    defaultValue: { pageNumber: 1, hasNextPage: true },
  });
