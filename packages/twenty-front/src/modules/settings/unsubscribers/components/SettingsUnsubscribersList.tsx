import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { isDefined } from 'twenty-shared/utils';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPaginationControls } from '@/settings/components/SettingsPaginationControls';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsUnsubscribersFilterDropdown } from '@/settings/unsubscribers/components/filter-dropdown/SettingsUnsubscribersFilterDropdown';
import { SETTINGS_UNSUBSCRIBERS_ALL_FILTER } from '@/settings/unsubscribers/constants/SettingsUnsubscribersAllFilter';
import { MESSAGE_SUPPRESSIONS_PAGE_SIZE } from '@/settings/unsubscribers/constants/MessageSuppressionsPageSize';
import { useMessageSuppressions } from '@/settings/unsubscribers/hooks/useMessageSuppressions';
import { getMessageSuppressionReasonBadge } from '@/settings/unsubscribers/utils/getMessageSuppressionReasonBadge';
import { Status } from 'twenty-ui/data-display';
import { SearchInput } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  MessageSuppressionReason,
  type MessageSuppressionsQuery,
} from '~/generated-metadata/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

type MessageSuppression =
  MessageSuppressionsQuery['messageSuppressions']['records'][number];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSearch = styled.div`
  flex: 1;
`;

export const SettingsUnsubscribersList = () => {
  const { t } = useLingui();

  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [reasonFilter, setReasonFilter] = useState(
    SETTINGS_UNSUBSCRIBERS_ALL_FILTER,
  );
  const [topicFilter, setTopicFilter] = useState(
    SETTINGS_UNSUBSCRIBERS_ALL_FILTER,
  );

  const { unsubscribeTopics } = useUnsubscribeTopics();

  const reason = Object.values(MessageSuppressionReason).find(
    (reasonValue) => reasonValue === reasonFilter,
  );
  const unsubscribeTopicId =
    topicFilter === SETTINGS_UNSUBSCRIBERS_ALL_FILTER ? undefined : topicFilter;

  const { messageSuppressions, totalCount, loading } = useMessageSuppressions({
    page,
    searchTerm: debouncedSearchText,
    reason,
    unsubscribeTopicId,
  });

  const goToFirstPage = () => setPage(0);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    goToFirstPage();
  };

  const handleReasonChange = (value: string) => {
    setReasonFilter(value);
    goToFirstPage();
  };

  const handleTopicChange = (value: string) => {
    setTopicFilter(value);
    goToFirstPage();
  };

  const handleClearFilters = () => {
    setReasonFilter(SETTINGS_UNSUBSCRIBERS_ALL_FILTER);
    setTopicFilter(SETTINGS_UNSUBSCRIBERS_ALL_FILTER);
    goToFirstPage();
  };

  const topicNameById = new Map(
    unsubscribeTopics.map((topic) => [topic.id, topic.name ?? t`Untitled topic`]),
  );

  const getScopeLabel = (topicId: string | null) => {
    if (!isDefined(topicId)) {
      return t`All emails`;
    }

    return topicNameById.get(topicId) ?? t`Unknown topic`;
  };

  const items = loading ? [] : messageSuppressions;
  const isEmpty = !loading && items.length === 0;
  const hasPagination = totalCount > MESSAGE_SUPPRESSIONS_PAGE_SIZE;
  const pageCount = Math.max(
    1,
    Math.ceil(totalCount / MESSAGE_SUPPRESSIONS_PAGE_SIZE),
  );

  return (
    <StyledContainer>
      <SettingsTableListSection<MessageSuppression>
        title={t`Unsubscribers`}
        description={t`Email addresses that will no longer receive campaign emails`}
        toolbar={
          <StyledToolbar>
            <StyledSearch>
              <SearchInput
                placeholder={t`Search by email address`}
                value={searchText}
                onChange={handleSearchChange}
              />
            </StyledSearch>
            <SettingsUnsubscribersFilterDropdown
              reasonValue={reasonFilter}
              topicValue={topicFilter}
              onChangeReason={handleReasonChange}
              onChangeTopic={handleTopicChange}
              onClear={handleClearFilters}
            />
          </StyledToolbar>
        }
        items={items}
        columns={[
          {
            label: t`Email address`,
            Cell: ({ item }) => <>{item.emailAddress}</>,
          },
          {
            label: t`Scope`,
            Cell: ({ item }) => <>{getScopeLabel(item.unsubscribeTopicId)}</>,
          },
          {
            label: t`Reason`,
            Cell: ({ item }) => {
              const badge = getMessageSuppressionReasonBadge(item.reason);

              return (
                <Status color={badge.color} text={badge.label} weight="medium" />
              );
            },
          },
          {
            label: t`Date`,
            align: 'right',
            Cell: ({ item }) => <>{formatToHumanReadableDate(item.createdAt)}</>,
          },
        ]}
        gridAutoColumns="1fr 160px 140px 160px"
      />
      {loading && <SettingsSectionSkeletonLoader />}
      {isEmpty && (
        <SettingsEmptyPlaceholder>
          {t`No unsubscribers found`}
        </SettingsEmptyPlaceholder>
      )}
      {hasPagination && (
        <SettingsPaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          isLoading={loading}
        />
      )}
    </StyledContainer>
  );
};
