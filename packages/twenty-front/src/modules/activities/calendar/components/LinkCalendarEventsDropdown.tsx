import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { searchTimelineCalendarEvents } from '@/activities/calendar/graphql/queries/searchTimelineCalendarEvents';
import { getTimelineCalendarEventLabel } from '@/activities/calendar/utils/getTimelineCalendarEventLabel';
import { LinkActivitiesDropdown } from '@/activities/components/LinkActivitiesDropdown';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconCalendarEvent } from 'twenty-ui/icon';
import {
  type SearchTimelineCalendarEventsQuery,
  type TimelineCalendarEvent,
} from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

type LinkCalendarEventsDropdownProps = {
  dropdownIdPrefix: string;
  trigger: ReactElement;
};

export const LinkCalendarEventsDropdown = ({
  dropdownIdPrefix,
  trigger,
}: LinkCalendarEventsDropdownProps) => {
  const { t } = useLingui();

  return (
    <LinkActivitiesDropdown<
      Pick<TimelineCalendarEvent, 'id' | 'title' | 'visibility' | 'startsAt'>,
      SearchTimelineCalendarEventsQuery
    >
      activityObjectNameSingular={CoreObjectNameSingular.CalendarEvent}
      dropdownIdPrefix={dropdownIdPrefix}
      ariaLabel={t`Link events`}
      trigger={trigger}
      searchQuery={searchTimelineCalendarEvents}
      getSearchResults={(data) => ({
        recordActivities:
          data.searchTimelineCalendarEvents.recordTimelineCalendarEvents,
        otherActivities:
          data.searchTimelineCalendarEvents.otherTimelineCalendarEvents,
      })}
      timelineQuery={getTimelineCalendarEventsFromObjectRecord}
      getOption={(calendarEvent) => ({
        label: getTimelineCalendarEventLabel(calendarEvent),
        description: formatToHumanReadableDate(calendarEvent.startsAt),
        startIcon: <IconCalendarEvent />,
      })}
      labels={{
        search: t`Search events`,
        loading: t`Loading events`,
        empty: t`No events found`,
        otherSection: t`Your other events`,
      }}
    />
  );
};
