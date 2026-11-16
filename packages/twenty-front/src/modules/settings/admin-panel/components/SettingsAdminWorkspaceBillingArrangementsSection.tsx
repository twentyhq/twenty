import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceBillingArrangementDetailsModal } from '@/settings/admin-panel/components/SettingsAdminWorkspaceBillingArrangementDetailsModal';
import { BILLING_ARRANGEMENT_REASON_LABELS } from '@/settings/admin-panel/constants/BillingArrangementReasonLabels';
import { BILLING_ARRANGEMENT_STATUS_TAGS } from '@/settings/admin-panel/constants/BillingArrangementStatusTags';
import { BILLING_ARRANGEMENT_TYPE_LABELS } from '@/settings/admin-panel/constants/BillingArrangementTypeLabels';
import { WORKSPACE_BILLING_ARRANGEMENTS } from '@/settings/admin-panel/graphql/queries/workspaceBillingArrangements';
import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { formatAdminBillingArrangementDetails } from '@/settings/admin-panel/utils/formatAdminBillingArrangementDetails';
import { formatAdminBillingArrangementEndDate } from '@/settings/admin-panel/utils/formatAdminBillingArrangementEndDate';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type WorkspaceBillingArrangementsQuery } from '~/generated-admin/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

type SettingsAdminWorkspaceBillingArrangementsSectionProps = {
  workspaceId: string;
};

const BILLING_ARRANGEMENTS_GRID_AUTO_COLUMNS = '1fr 1fr 1fr 1fr 1fr 1fr';
const BILLING_ARRANGEMENT_DETAILS_MODAL_ID =
  'settings-admin-workspace-billing-arrangement-details';

export const SettingsAdminWorkspaceBillingArrangementsSection = ({
  workspaceId,
}: SettingsAdminWorkspaceBillingArrangementsSectionProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { openDialog } = useDialog();
  const apolloAdminClient = useApolloAdminClient();

  const [selectedArrangement, setSelectedArrangement] =
    useState<AdminBillingArrangement | null>(null);

  const { data, loading, error } = useQuery<WorkspaceBillingArrangementsQuery>(
    WORKSPACE_BILLING_ARRANGEMENTS,
    {
      client: apolloAdminClient,
      variables: { workspaceId },
      fetchPolicy: 'network-only',
    },
  );

  if (loading) {
    return <SettingsSectionSkeletonLoader rowCount={3} />;
  }

  const billingArrangements = data?.workspaceBillingArrangements ?? [];

  const handleRowClick = (arrangement: AdminBillingArrangement) => {
    setSelectedArrangement(arrangement);
    openDialog(BILLING_ARRANGEMENT_DETAILS_MODAL_ID);
  };

  return (
    <Section.Root>
      <SettingsTableListSection<AdminBillingArrangement>
        title={t`Arrangements`}
        description={t`Commercial exceptions to the plan, with why and until when.`}
        items={billingArrangements}
        onRowClick={handleRowClick}
        columns={[
          {
            label: t`Type`,
            overflow: 'hidden',
            Cell: ({ item }) => (
              <OverflowingTextWithTooltip
                text={t(BILLING_ARRANGEMENT_TYPE_LABELS[item.type])}
              />
            ),
          },
          {
            label: t`Details`,
            overflow: 'hidden',
            Cell: ({ item }) => (
              <OverflowingTextWithTooltip
                text={formatAdminBillingArrangementDetails({
                  arrangement: item,
                  formatNumber,
                })}
              />
            ),
          },
          {
            label: t`Reason`,
            overflow: 'hidden',
            Cell: ({ item }) => (
              <OverflowingTextWithTooltip
                text={t(BILLING_ARRANGEMENT_REASON_LABELS[item.label])}
              />
            ),
          },
          {
            label: t`Status`,
            Cell: ({ item }) => {
              const status = BILLING_ARRANGEMENT_STATUS_TAGS[item.status];

              return <Tag color={status.color}>{t(status.label)}</Tag>;
            },
          },
          {
            label: t`Starts`,
            Cell: ({ item }) => <>{beautifyExactDate(item.startsAt)}</>,
          },
          {
            label: t`Ends`,
            Cell: ({ item }) => (
              <>{formatAdminBillingArrangementEndDate(item)}</>
            ),
          },
        ]}
        gridAutoColumns={BILLING_ARRANGEMENTS_GRID_AUTO_COLUMNS}
      />

      {isDefined(error) && (
        <SettingsEmptyPlaceholder>{t`Failed to load billing arrangements.`}</SettingsEmptyPlaceholder>
      )}

      <SettingsAdminWorkspaceBillingArrangementDetailsModal
        modalInstanceId={BILLING_ARRANGEMENT_DETAILS_MODAL_ID}
        arrangement={selectedArrangement}
      />
    </Section.Root>
  );
};
