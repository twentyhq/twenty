import { useMutation } from '@apollo/client/react';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type ThemeColor } from 'twenty-ui/theme';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceBillingArrangementRowDropdownMenu } from '@/settings/admin-panel/components/SettingsAdminWorkspaceBillingArrangementRowDropdownMenu';
import { BILLING_ARRANGEMENT_REASON_LABELS } from '@/settings/admin-panel/constants/BillingArrangementReasonLabels';
import { BILLING_ARRANGEMENT_TYPE_LABELS } from '@/settings/admin-panel/constants/BillingArrangementTypeLabels';
import { END_WORKSPACE_BILLING_ARRANGEMENT } from '@/settings/admin-panel/graphql/mutations/endWorkspaceBillingArrangement';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { formatAdminBillingArrangementDetails } from '@/settings/admin-panel/utils/formatAdminBillingArrangementDetails';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { BillingArrangementStatus } from '~/generated-admin/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

type SettingsAdminWorkspaceBillingArrangementsTableProps = {
  workspaceId: string;
  billingArrangements: AdminBillingArrangement[];
  onAddArrangementClick: () => void;
};

// Each row is its own grid, so only the overflow-hidden columns may flex without misaligning rows.
const BILLING_ARRANGEMENTS_GRID_AUTO_COLUMNS =
  '120px 1fr 1fr 80px 108px 108px 36px';
const END_BILLING_ARRANGEMENT_MODAL_ID = 'end-billing-arrangement-modal';
const EM_DASH = '—';

const STATUS_TAGS: Record<
  BillingArrangementStatus,
  { label: MessageDescriptor; color: ThemeColor }
> = {
  [BillingArrangementStatus.ACTIVE]: { label: msg`Active`, color: 'green' },
  [BillingArrangementStatus.SCHEDULED]: {
    label: msg`Scheduled`,
    color: 'blue',
  },
  [BillingArrangementStatus.ENDED]: { label: msg`Ended`, color: 'gray' },
  [BillingArrangementStatus.ONE_TIME]: {
    label: msg`One-time`,
    color: 'gray',
  },
};

const ENDABLE_STATUSES: BillingArrangementStatus[] = [
  BillingArrangementStatus.ACTIVE,
  BillingArrangementStatus.SCHEDULED,
];

export const SettingsAdminWorkspaceBillingArrangementsTable = ({
  workspaceId,
  billingArrangements,
  onAddArrangementClick,
}: SettingsAdminWorkspaceBillingArrangementsTableProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const apolloAdminClient = useApolloAdminClient();

  const [arrangementPendingEnd, setArrangementPendingEnd] =
    useState<AdminBillingArrangement | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const [endWorkspaceBillingArrangement] = useMutation(
    END_WORKSPACE_BILLING_ARRANGEMENT,
    {
      client: apolloAdminClient,
      refetchQueries: [GET_WORKSPACE_BILLING_ADMIN_PANEL],
    },
  );

  const isEndable = (arrangement: AdminBillingArrangement) =>
    arrangement.isManageable && ENDABLE_STATUSES.includes(arrangement.status);

  const handleEndClick = (arrangement: AdminBillingArrangement) => {
    setArrangementPendingEnd(arrangement);
    openDialog(END_BILLING_ARRANGEMENT_MODAL_ID);
  };

  const handleEnd = async (billingArrangementId: string) => {
    setIsEnding(true);

    try {
      await endWorkspaceBillingArrangement({
        variables: { workspaceId, billingArrangementId },
      });

      enqueueToast({ status: 'success', children: t`Arrangement ended.` });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsEnding(false);
      setArrangementPendingEnd(null);
    }
  };

  const formatEndDate = (arrangement: AdminBillingArrangement): string => {
    if (arrangement.status === BillingArrangementStatus.ONE_TIME) {
      return EM_DASH;
    }

    return isDefined(arrangement.endDate)
      ? beautifyExactDate(arrangement.endDate)
      : t`Never`;
  };

  const formatReason = (arrangement: AdminBillingArrangement): string => {
    const reason = t(BILLING_ARRANGEMENT_REASON_LABELS[arrangement.label]);

    return isDefined(arrangement.comment)
      ? `${reason} · ${arrangement.comment}`
      : reason;
  };

  const pendingEndTypeLabel = isDefined(arrangementPendingEnd)
    ? t(BILLING_ARRANGEMENT_TYPE_LABELS[arrangementPendingEnd.type])
    : '';

  return (
    <>
      <SettingsTableListSection<AdminBillingArrangement>
        title={t`Arrangements`}
        description={t`Commercial exceptions to the plan, with why and until when. Ended ones stay listed.`}
        items={billingArrangements}
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
              <OverflowingTextWithTooltip text={formatReason(item)} />
            ),
          },
          {
            label: t`Status`,
            Cell: ({ item }) => {
              const status = STATUS_TAGS[item.status];

              return <Tag color={status.color}>{t(status.label)}</Tag>;
            },
          },
          {
            label: t`Starts`,
            Cell: ({ item }) => <>{beautifyExactDate(item.startsAt)}</>,
          },
          {
            label: t`Ends`,
            Cell: ({ item }) => <>{formatEndDate(item)}</>,
          },
          {
            label: '',
            align: 'right',
            Cell: ({ item }) =>
              isEndable(item) ? (
                <SettingsAdminWorkspaceBillingArrangementRowDropdownMenu
                  billingArrangementId={item.id}
                  onEnd={() => handleEndClick(item)}
                />
              ) : null,
          },
        ]}
        gridAutoColumns={BILLING_ARRANGEMENTS_GRID_AUTO_COLUMNS}
        footerButtonLabel={t`Add arrangement`}
        onFooterButtonClick={onAddArrangementClick}
      />

      <ConfirmationDialog
        dialogId={END_BILLING_ARRANGEMENT_MODAL_ID}
        title={t`End arrangement`}
        subtitle={t`The ${pendingEndTypeLabel} arrangement stops applying now and stays in the history. It cannot be restarted: add a new one instead.`}
        confirmButtonText={t`End`}
        loading={isEnding}
        onConfirmClick={() => {
          if (isDefined(arrangementPendingEnd)) {
            handleEnd(arrangementPendingEnd.id);
          }
        }}
        onClose={() => setArrangementPendingEnd(null)}
      />
    </>
  );
};
