import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  MessageSuppressionReason,
  MessageSuppressionsDocument,
  type MessageSuppressionsQuery,
} from '~/generated-metadata/graphql';
import { Status } from 'twenty-ui/data-display';
import { Button } from 'twenty-ui/input';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { formatToHumanReadableDate } from '~/utils/date-utils';

type MessageSuppression =
  MessageSuppressionsQuery['messageSuppressions']['records'][number];

const MESSAGE_SUPPRESSIONS_PAGE_SIZE = 30;

const MESSAGE_SUPPRESSION_REASON_TO_COLOR: Partial<
  Record<MessageSuppressionReason, ThemeColor>
> = {
  [MessageSuppressionReason.UNSUBSCRIBE]: 'gray',
  [MessageSuppressionReason.COMPLAINT]: 'red',
  [MessageSuppressionReason.BOUNCE]: 'orange',
};

const StyledPaginationRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceUnsubscribers = () => {
  const { t } = useLingui();
  const [offset, setOffset] = useState(0);

  const isEmailGroupEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const { data, loading } = useQuery(MessageSuppressionsDocument, {
    variables: {
      input: { limit: MESSAGE_SUPPRESSIONS_PAGE_SIZE, offset },
    },
    skip: !isEmailGroupEnabled,
  });

  if (!isEmailGroupEnabled) {
    return null;
  }

  const records = data?.messageSuppressions.records ?? [];
  const totalCount = data?.messageSuppressions.totalCount ?? 0;

  const reasonLabels: Record<MessageSuppressionReason, string> = {
    [MessageSuppressionReason.UNSUBSCRIBE]: t`Unsubscribed`,
    [MessageSuppressionReason.COMPLAINT]: t`Complaint`,
    [MessageSuppressionReason.BOUNCE]: t`Bounce`,
  };

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
            items={records}
            columns={[
              {
                label: t`Email address`,
                Cell: ({ item }) => <>{item.emailAddress}</>,
              },
              {
                label: t`Reason`,
                Cell: ({ item }) => (
                  <Status
                    color={
                      MESSAGE_SUPPRESSION_REASON_TO_COLOR[item.reason] ?? 'gray'
                    }
                    text={reasonLabels[item.reason]}
                  />
                ),
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
              disabled={offset === 0}
              onClick={() =>
                setOffset((currentOffset) =>
                  Math.max(0, currentOffset - MESSAGE_SUPPRESSIONS_PAGE_SIZE),
                )
              }
            />
            <Button
              title={t`Next`}
              variant="secondary"
              size="small"
              disabled={offset + MESSAGE_SUPPRESSIONS_PAGE_SIZE >= totalCount}
              onClick={() =>
                setOffset(
                  (currentOffset) =>
                    currentOffset + MESSAGE_SUPPRESSIONS_PAGE_SIZE,
                )
              }
            />
          </StyledPaginationRow>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
