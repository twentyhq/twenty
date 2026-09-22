import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPaginationControls } from '@/settings/components/SettingsPaginationControls';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { MESSAGE_SUPPRESSIONS_PAGE_SIZE } from '@/settings/unsubscribers/constants/MessageSuppressionsPageSize';
import { useMessageTrackingOptOuts } from '@/settings/unsubscribers/hooks/useMessageTrackingOptOuts';
import { SearchInput } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  MessageTrackingConsentSource,
  type MessageTrackingOptOutsQuery,
} from '~/generated-metadata/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

type MessageTrackingOptOut =
  MessageTrackingOptOutsQuery['messageTrackingOptOuts']['records'][number];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledEmailAddress = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

export const SettingsTrackingOptOutsList = () => {
  const { t } = useLingui();
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const { records, totalCount, loading } = useMessageTrackingOptOuts({
    page,
    searchTerm: debouncedSearchText,
  });
  const pageCount = Math.max(
    1,
    Math.ceil(totalCount / MESSAGE_SUPPRESSIONS_PAGE_SIZE),
  );

  return (
    <StyledContainer>
      <SettingsTableListSection<MessageTrackingOptOut>
        title={t`Tracking opt-outs`}
        description={t`Email addresses that declined campaign click tracking`}
        toolbar={
          <SearchInput
            placeholder={t`Search by email address`}
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              setPage(0);
            }}
          />
        }
        items={loading ? [] : records}
        columns={[
          {
            label: t`Email address`,
            Cell: ({ item }) => (
              <StyledEmailAddress>{item.emailAddress}</StyledEmailAddress>
            ),
          },
          {
            label: t`Source`,
            Cell: ({ item }) => (
              <>
                {item.source === MessageTrackingConsentSource.PREFERENCES_PAGE
                  ? t`Recipient`
                  : t`Workspace member`}
              </>
            ),
          },
          {
            label: t`Date`,
            align: 'right',
            Cell: ({ item }) => (
              <>{formatToHumanReadableDate(item.createdAt)}</>
            ),
          },
        ]}
        gridAutoColumns="1fr 160px 160px"
      />
      {loading && <SettingsSectionSkeletonLoader />}
      {!loading && records.length === 0 && (
        <SettingsEmptyPlaceholder>
          {t`No tracking opt-outs found`}
        </SettingsEmptyPlaceholder>
      )}
      {totalCount > MESSAGE_SUPPRESSIONS_PAGE_SIZE && (
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
