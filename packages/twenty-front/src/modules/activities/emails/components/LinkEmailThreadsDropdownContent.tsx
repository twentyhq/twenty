import { LinkEmailThreadOptionItem } from '@/activities/emails/components/LinkEmailThreadOptionItem';
import { searchTimelineThreads } from '@/activities/emails/graphql/queries/searchTimelineThreads';
import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
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
  type SearchTimelineThreadsQuery,
  type SearchTimelineThreadsQueryVariables,
} from '~/generated/graphql';

const LINK_EMAIL_THREADS_SEARCH_LIMIT = 20;

type LinkEmailThreadsDropdownContentProps = {
  targetRecord: ActivityTargetableObject;
  activityLinkConfig: ActivityLinkConfig;
};

export const LinkEmailThreadsDropdownContent = ({
  targetRecord,
  activityLinkConfig,
}: LinkEmailThreadsDropdownContentProps) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 300);

  const { relatedCompany } = activityLinkConfig;

  const { data, loading } = useQuery<
    SearchTimelineThreadsQuery,
    SearchTimelineThreadsQueryVariables
  >(searchTimelineThreads, {
    client: apolloCoreClient,
    variables: {
      objectNameSingular: CoreObjectNameSingular.Company,
      recordId: relatedCompany.id,
      searchInput: debouncedSearch,
      limit: LINK_EMAIL_THREADS_SEARCH_LIMIT,
    },
  });

  const companyThreads =
    data?.searchTimelineThreads.recordTimelineThreads ?? [];
  const otherThreads = data?.searchTimelineThreads.otherTimelineThreads ?? [];

  const { linkedActivityIds, pendingActivityIds, toggleActivityLink } =
    useToggleActivityLink({
      targetRecord,
      activityLinkConfig,
      activityIds: [...companyThreads, ...otherThreads].map(({ id }) => id),
      timelineQuery: getTimelineThreadsFromObjectRecord,
    });

  const areThreadsStale = loading || debouncedSearch !== trimmedSearch;

  return (
    <>
      <Dropdown.Search
        aria-label={t`Search email threads`}
        placeholder={t`Search email threads`}
        value={search}
        onValueChange={setSearch}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable label={relatedCompany.name}>
        {companyThreads.map((thread) => (
          <LinkEmailThreadOptionItem
            key={thread.id}
            thread={thread}
            isLinked={linkedActivityIds.has(thread.id)}
            disabled={areThreadsStale || pendingActivityIds.includes(thread.id)}
            onToggle={toggleActivityLink}
          />
        ))}
        {companyThreads.length === 0 &&
          (areThreadsStale ? (
            <Dropdown.Loading>{t`Loading email threads`}</Dropdown.Loading>
          ) : (
            <Dropdown.Empty>{t`No email threads found`}</Dropdown.Empty>
          ))}
      </Dropdown.Section>
      {otherThreads.length > 0 && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section scrollable label={t`Your other email threads`}>
            {otherThreads.map((thread) => (
              <LinkEmailThreadOptionItem
                key={thread.id}
                thread={thread}
                isLinked={linkedActivityIds.has(thread.id)}
                disabled={
                  areThreadsStale || pendingActivityIds.includes(thread.id)
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
