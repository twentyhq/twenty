import { LinkEmailThreadOptionItem } from '@/activities/emails/components/LinkEmailThreadOptionItem';
import { searchTimelineThreads } from '@/activities/emails/graphql/queries/searchTimelineThreads';
import { type EmailThreadLinkConfig } from '@/activities/emails/hooks/useEmailThreadLinkConfig';
import { useToggleEmailThreadLink } from '@/activities/emails/hooks/useToggleEmailThreadLink';
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
  emailThreadLinkConfig: EmailThreadLinkConfig;
};

export const LinkEmailThreadsDropdownContent = ({
  targetRecord,
  emailThreadLinkConfig,
}: LinkEmailThreadsDropdownContentProps) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 300);

  const { relatedCompany, messageThreadTargetJoinColumnName } =
    emailThreadLinkConfig;

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

  const {
    linkedMessageThreadIds,
    pendingMessageThreadIds,
    toggleEmailThreadLink,
  } = useToggleEmailThreadLink({
    targetRecord,
    messageThreadTargetJoinColumnName,
    messageThreadIds: [...companyThreads, ...otherThreads].map(({ id }) => id),
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
            isLinked={linkedMessageThreadIds.has(thread.id)}
            disabled={
              areThreadsStale || pendingMessageThreadIds.includes(thread.id)
            }
            onToggle={toggleEmailThreadLink}
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
          <Dropdown.Section scrollable label={t`Other email threads`}>
            {otherThreads.map((thread) => (
              <LinkEmailThreadOptionItem
                key={thread.id}
                thread={thread}
                isLinked={linkedMessageThreadIds.has(thread.id)}
                disabled={
                  areThreadsStale || pendingMessageThreadIds.includes(thread.id)
                }
                onToggle={toggleEmailThreadLink}
              />
            ))}
          </Dropdown.Section>
        </>
      )}
    </>
  );
};
