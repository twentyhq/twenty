import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceBillingArrangementDetailsModal } from '@/settings/admin-panel/components/SettingsAdminWorkspaceBillingArrangementDetailsModal';
import { SettingsAdminWorkspaceBillingArrangementModal } from '@/settings/admin-panel/components/SettingsAdminWorkspaceBillingArrangementModal';
import { SettingsAdminWorkspaceBillingArrangementRowDropdownMenu } from '@/settings/admin-panel/components/SettingsAdminWorkspaceBillingArrangementRowDropdownMenu';
import { BILLING_ARRANGEMENT_REASON_LABELS } from '@/settings/admin-panel/constants/BillingArrangementReasonLabels';
import { BILLING_ARRANGEMENT_STATUS_TAGS } from '@/settings/admin-panel/constants/BillingArrangementStatusTags';
import { BILLING_ARRANGEMENT_TYPE_LABELS } from '@/settings/admin-panel/constants/BillingArrangementTypeLabels';
import { END_BILLING_ARRANGEMENT_DIALOG_ID } from '@/settings/admin-panel/constants/EndBillingArrangementDialogId';
import { END_WORKSPACE_BILLING_ARRANGEMENT } from '@/settings/admin-panel/graphql/mutations/endWorkspaceBillingArrangement';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { WORKSPACE_BILLING_ARRANGEMENTS } from '@/settings/admin-panel/graphql/queries/workspaceBillingArrangements';
import { adminPanelBillingArrangementIdPendingEndState } from '@/settings/admin-panel/states/adminPanelBillingArrangementIdPendingEndState';
import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { formatAdminBillingArrangementDetails } from '@/settings/admin-panel/utils/formatAdminBillingArrangementDetails';
import { formatAdminBillingArrangementEndDate } from '@/settings/admin-panel/utils/formatAdminBillingArrangementEndDate';
import { useUsageLimitFormatter } from '@/settings/billing/hooks/useUsageLimitFormatter';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  BillingArrangementStatus,
  BillingArrangementType,
  type WorkspaceBillingArrangementsQuery,
} from '~/generated-admin/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

type SettingsAdminWorkspaceBillingArrangementsSectionProps = {
  workspaceId: string;
};

const BILLING_ARRANGEMENTS_GRID_AUTO_COLUMNS = '1fr 1fr 1fr 1fr 1fr 1fr 36px';
const ADD_BILLING_ARRANGEMENT_MODAL_ID =
  'settings-admin-add-workspace-billing-arrangement';
const BILLING_ARRANGEMENT_DETAILS_MODAL_ID =
  'settings-admin-workspace-billing-arrangement-details';

const ENDABLE_STATUSES: BillingArrangementStatus[] = [
  BillingArrangementStatus.ACTIVE,
  BillingArrangementStatus.SCHEDULED,
];

export const SettingsAdminWorkspaceBillingArrangementsSection = ({
  workspaceId,
}: SettingsAdminWorkspaceBillingArrangementsSectionProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { formatLimitValue } = useUsageLimitFormatter();
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const apolloAdminClient = useApolloAdminClient();

  const [
    adminPanelBillingArrangementIdPendingEnd,
    setAdminPanelBillingArrangementIdPendingEnd,
  ] = useAtomState(adminPanelBillingArrangementIdPendingEndState);
  const [isEnding, setIsEnding] = useState(false);
  const [selectedArrangementId, setSelectedArrangementId] = useState<
    string | null
  >(null);

  const { data, loading, error } = useQuery<WorkspaceBillingArrangementsQuery>(
    WORKSPACE_BILLING_ARRANGEMENTS,
    {
      client: apolloAdminClient,
      variables: { workspaceId },
      fetchPolicy: 'network-only',
    },
  );

  const [endWorkspaceBillingArrangement] = useMutation(
    END_WORKSPACE_BILLING_ARRANGEMENT,
    {
      client: apolloAdminClient,
    },
  );

  if (loading) {
    return <SettingsSectionSkeletonLoader rowCount={3} />;
  }

  const billingArrangements = data?.workspaceBillingArrangements ?? [];

  const selectedArrangement = billingArrangements.find(
    (arrangement) => arrangement.id === selectedArrangementId,
  );

  const arrangementPendingEnd = billingArrangements.find(
    (arrangement) =>
      arrangement.id === adminPanelBillingArrangementIdPendingEnd,
  );

  const isEndable = (arrangement: AdminBillingArrangement) =>
    arrangement.isManageable && ENDABLE_STATUSES.includes(arrangement.status);

  const handleRowClick = (arrangement: AdminBillingArrangement) => {
    setSelectedArrangementId(arrangement.id);
    openDialog(BILLING_ARRANGEMENT_DETAILS_MODAL_ID);
  };

  const handleEnd = async (arrangement: AdminBillingArrangement) => {
    setIsEnding(true);

    try {
      await endWorkspaceBillingArrangement({
        variables: { workspaceId, billingArrangementId: arrangement.id },
        refetchQueries:
          arrangement.type === BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE
            ? [
                WORKSPACE_BILLING_ARRANGEMENTS,
                GET_WORKSPACE_BILLING_ADMIN_PANEL,
              ]
            : [WORKSPACE_BILLING_ARRANGEMENTS],
      });

      enqueueToast({ status: 'success', children: t`Arrangement ended.` });
    } catch (endError) {
      enqueueToast(getToastOptionsFromError({ error: endError }));
    } finally {
      setIsEnding(false);
      setAdminPanelBillingArrangementIdPendingEnd(null);
    }
  };

  const pendingEndTypeLabel = isDefined(arrangementPendingEnd)
    ? t(BILLING_ARRANGEMENT_TYPE_LABELS[arrangementPendingEnd.type])
    : '';

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
                  formatLimitValue,
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
          {
            label: '',
            align: 'right',
            Cell: ({ item }) =>
              isEndable(item) ? (
                <SettingsAdminWorkspaceBillingArrangementRowDropdownMenu
                  billingArrangementId={item.id}
                />
              ) : null,
          },
        ]}
        gridAutoColumns={BILLING_ARRANGEMENTS_GRID_AUTO_COLUMNS}
        footerButtonLabel={isDefined(error) ? undefined : t`Add arrangement`}
        onFooterButtonClick={() => openDialog(ADD_BILLING_ARRANGEMENT_MODAL_ID)}
      />

      {isDefined(error) && (
        <SettingsEmptyPlaceholder>{t`Failed to load billing arrangements.`}</SettingsEmptyPlaceholder>
      )}

      <SettingsAdminWorkspaceBillingArrangementModal
        modalInstanceId={ADD_BILLING_ARRANGEMENT_MODAL_ID}
        workspaceId={workspaceId}
      />

      {isDefined(selectedArrangement) && (
        <SettingsAdminWorkspaceBillingArrangementDetailsModal
          modalInstanceId={BILLING_ARRANGEMENT_DETAILS_MODAL_ID}
          arrangement={selectedArrangement}
        />
      )}

      <ConfirmationDialog
        dialogId={END_BILLING_ARRANGEMENT_DIALOG_ID}
        title={t`End arrangement`}
        subtitle={t`The ${pendingEndTypeLabel} arrangement stops applying now and stays in the history. It cannot be restarted: add a new one instead.`}
        confirmButtonText={t`End`}
        loading={isEnding}
        onConfirmClick={() => {
          if (isDefined(arrangementPendingEnd)) {
            handleEnd(arrangementPendingEnd);
          }
        }}
        onClose={() => setAdminPanelBillingArrangementIdPendingEnd(null)}
      />
    </Section.Root>
  );
};
