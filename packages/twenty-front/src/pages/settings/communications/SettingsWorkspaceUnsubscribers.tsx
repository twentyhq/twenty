import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { MESSAGE_SUPPRESSIONS_PAGE_SIZE } from '@/settings/unsubscribers/constants/MessageSuppressionsPageSize';
import { useMessageSuppressions } from '@/settings/unsubscribers/hooks/useMessageSuppressions';
import { getMessageSuppressionReasonBadge } from '@/settings/unsubscribers/utils/getMessageSuppressionReasonBadge';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/data-display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type MessageSuppressionsQuery } from '~/generated-metadata/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

type MessageSuppression =
  MessageSuppressionsQuery['messageSuppressions']['records'][number];

const StyledPaginationRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceUnsubscribers = () => {
  const { t } = useLingui();
  const [page, setPage] = useState(0);

  const isEmailGroupEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const { messageSuppressions, totalCount, loading } = useMessageSuppressions({
    page,
    skip: !isEmailGroupEnabled,
  });

  if (!isEmailGroupEnabled) {
    return null;
  }

  const pageCount = Math.max(
    1,
    Math.ceil(totalCount / MESSAGE_SUPPRESSIONS_PAGE_SIZE),
  );

  return (
    <SettingsPageLayout
      title={t`Unsubscribers`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: t`Unsubscribers` },
      ]}
    >
      <SettingsPageContainer>
        {loading ? (
          <SettingsSkeletonLoader />
        ) : (
          <SettingsTableListSection<MessageSuppression>
            title={t`Unsubscribers`}
            description={t`Email addresses that will no longer receive campaign emails`}
            items={messageSuppressions}
            columns={[
              {
                label: t`Email address`,
                Cell: ({ item }) => <>{item.emailAddress}</>,
              },
              {
                label: t`Reason`,
                Cell: ({ item }) => {
                  const badge = getMessageSuppressionReasonBadge(item.reason);

                  return (
                    <Status
                      color={badge.color}
                      text={badge.label}
                      weight="medium"
                    />
                  );
                },
              },
              {
                label: t`Date added`,
                Cell: ({ item }) => (
                  <>{formatToHumanReadableDate(item.createdAt)}</>
                ),
              },
            ]}
            gridAutoColumns="1fr 140px 160px"
          />
        )}
        {totalCount > MESSAGE_SUPPRESSIONS_PAGE_SIZE && (
          <StyledPaginationRow>
            <Button
              title={t`Previous`}
              variant="secondary"
              size="small"
              disabled={page === 0 || loading}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            />
            <div>
              {t`Page`} {page + 1} {t`of`} {pageCount}
            </div>
            <Button
              title={t`Next`}
              variant="secondary"
              size="small"
              disabled={page + 1 >= pageCount || loading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            />
          </StyledPaginationRow>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
