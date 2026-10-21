import { LinkCalendarEventOptionItem } from '@/activities/calendar/components/LinkCalendarEventOptionItem';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { searchTimelineCalendarEvents } from '@/activities/calendar/graphql/queries/searchTimelineCalendarEvents';
import { type ActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { useToggleActivityLink } from '@/activities/hooks/useToggleActivityLink';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useDebounce } from 'use-debounce';
import {
  type SearchTimelineCalendarEventsQuery,
  type SearchTimelineCalendarEventsQueryVariables,
} from '~/generated/graphql';

const LINK_CALENDAR_EVENTS_SEARCH_LIMIT = 20;

type LinkCalendarEventsDropdownContentProps = {
  targetRecord: ActivityTargetableObject;
  activityLinkConfig: ActivityLinkConfig;
};

export const LinkCalendarEventsDropdownContent = ({
  targetRecord,
  activityLinkConfig,
}: LinkCalendarEventsDropdownContentProps) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 300);

  const { relatedCompany } = activityLinkConfig;

  const { data, loading } = useQuery<
    SearchTimelineCalendarEventsQuery,
    SearchTimelineCalendarEventsQueryVariables
  >(searchTimelineCalendarEvents, {
    client: apolloCoreClient,
    variables: {
      objectNameSingular: CoreObjectNameSingular.Company,
      recordId: relatedCompany.id,
      searchInput: debouncedSearch,
      limit: LINK_CALENDAR_EVENTS_SEARCH_LIMIT,
    },
  });

  const companyCalendarEvents =
    data?.searchTimelineCalendarEvents.recordTimelineCalendarEvents ?? [];
  const otherCalendarEvents =
    data?.searchTimelineCalendarEvents.otherTimelineCalendarEvents ?? [];

  const { linkedActivityIds, pendingActivityIds, toggleActivityLink } =
    useToggleActivityLink({
      targetRecord,
      activityLinkConfig,
      activityIds: [...companyCalendarEvents, ...otherCalendarEvents].map(
        ({ id }) => id,
      ),
      timelineQuery: getTimelineCalendarEventsFromObjectRecord,
    });

  const areCalendarEventsStale = loading || debouncedSearch !== trimmedSearch;

  return (
    <>
      <Dropdown.Search
        aria-label={t`Search events`}
        placeholder={t`Search events`}
        value={search}
        onValueChange={setSearch}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable label={relatedCompany.name}>
        {companyCalendarEvents.map((calendarEvent) => (
          <LinkCalendarEventOptionItem
            key={calendarEvent.id}
            calendarEvent={calendarEvent}
            isLinked={linkedActivityIds.has(calendarEvent.id)}
            disabled={
              areCalendarEventsStale ||
              pendingActivityIds.includes(calendarEvent.id)
            }
            onToggle={toggleActivityLink}
          />
        ))}
        {companyCalendarEvents.length === 0 &&
          (areCalendarEventsStale ? (
            <Dropdown.Loading>{t`Loading events`}</Dropdown.Loading>
          ) : (
            <Dropdown.Empty>{t`No events found`}</Dropdown.Empty>
          ))}
      </Dropdown.Section>
      {otherCalendarEvents.length > 0 && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section scrollable label={t`Your other events`}>
            {otherCalendarEvents.map((calendarEvent) => (
              <LinkCalendarEventOptionItem
                key={calendarEvent.id}
                calendarEvent={calendarEvent}
                isLinked={linkedActivityIds.has(calendarEvent.id)}
                disabled={
                  areCalendarEventsStale ||
                  pendingActivityIds.includes(calendarEvent.id)
                }
                onToggle={toggleActivityLink}
              />
            ))}
          </Dropdown.Section>
        </>
      )}
    </>
  );
};
