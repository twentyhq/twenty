import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceCreditGrantRowDropdownMenu } from '@/settings/admin-panel/components/SettingsAdminWorkspaceCreditGrantRowDropdownMenu';
import { CREDIT_GRANT_TYPE_COLORS } from '@/settings/admin-panel/constants/CreditGrantTypeColors';
import { CREDIT_GRANT_TYPE_LABELS } from '@/settings/admin-panel/constants/CreditGrantTypeLabels';
import { REVOKE_WORKSPACE_CREDIT_GRANT } from '@/settings/admin-panel/graphql/mutations/revokeWorkspaceCreditGrant';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { beautifyExactDate } from '~/utils/date-utils';
import { type WorkspaceBillingAdminPanelQuery } from '~/generated-admin/graphql';

type CreditGrant = NonNullable<
  WorkspaceBillingAdminPanelQuery['workspaceBillingAdminPanel']
>['creditGrants'][number];

type SettingsAdminWorkspaceCreditGrantsTableProps = {
  workspaceId: string;
  creditGrants: CreditGrant[];
  onGrantCreditsClick: () => void;
};

const CREDIT_GRANTS_GRID_AUTO_COLUMNS = '1fr 1fr 1fr 1fr 2fr 36px';
const REVOKE_CREDIT_GRANT_MODAL_ID = 'revoke-credit-grant-modal';
const EM_DASH = '—';

const getStatus = (
  creditGrant: CreditGrant,
): { label: MessageDescriptor; color: ThemeColor } => {
  if (isDefined(creditGrant.revokedAt)) {
    return { label: msg`Revoked`, color: 'red' };
  }

  if (creditGrant.isActive) {
    return { label: msg`Active`, color: 'green' };
  }

  return { label: msg`Expired`, color: 'gray' };
};

export const SettingsAdminWorkspaceCreditGrantsTable = ({
  workspaceId,
  creditGrants,
  onGrantCreditsClick,
}: SettingsAdminWorkspaceCreditGrantsTableProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const apolloAdminClient = useApolloAdminClient();
  const { openModal } = useModal();

  const [grantPendingRevocation, setGrantPendingRevocation] =
    useState<CreditGrant | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const [revokeWorkspaceCreditGrant] = useMutation(
    REVOKE_WORKSPACE_CREDIT_GRANT,
    {
      client: apolloAdminClient,
      refetchQueries: [GET_WORKSPACE_BILLING_ADMIN_PANEL],
    },
  );

  const formatCredits = (credits: number): string =>
    formatNumber(credits, { decimals: 2 });

  const handleRevokeClick = (creditGrant: CreditGrant) => {
    setGrantPendingRevocation(creditGrant);
    openModal(REVOKE_CREDIT_GRANT_MODAL_ID);
  };

  const handleRevoke = async (creditGrantId: string) => {
    // The refetch that clears the row lands well after the mutation resolves,
    // so without this the button stays live and a second click revokes an
    // already revoked grant.
    setIsRevoking(true);

    try {
      await revokeWorkspaceCreditGrant({
        variables: { workspaceId, creditGrantId },
      });

      enqueueSuccessSnackBar({ message: t`Credit grant revoked.` });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsRevoking(false);
      setGrantPendingRevocation(null);
    }
  };

  return (
    <>
      <SettingsTableListSection<CreditGrant>
        title={t`Granted credits`}
        description={t`Credits handed out on top of the plan allowance`}
        items={creditGrants}
        columns={[
          {
            label: t`Amount`,
            align: 'right',
            Cell: ({ item }) => <>{formatCredits(item.amount)}</>,
          },
          {
            label: t`Type`,
            Cell: ({ item }) => (
              <Tag
                color={CREDIT_GRANT_TYPE_COLORS[item.type]}
                text={t(CREDIT_GRANT_TYPE_LABELS[item.type])}
              />
            ),
          },
          {
            label: t`Status`,
            Cell: ({ item }) => {
              const status = getStatus(item);

              return <Tag color={status.color} text={t(status.label)} />;
            },
          },
          {
            label: t`Expires`,
            Cell: ({ item }) => <>{beautifyExactDate(item.expiresAt)}</>,
          },
          {
            label: t`Reason`,
            overflow: 'hidden',
            Cell: ({ item }) => (
              <OverflowingTextWithTooltip text={item.reason ?? EM_DASH} />
            ),
          },
          {
            label: '',
            align: 'right',
            Cell: ({ item }) =>
              item.isActive ? (
                <SettingsAdminWorkspaceCreditGrantRowDropdownMenu
                  creditGrantId={item.id}
                  onRevoke={() => handleRevokeClick(item)}
                />
              ) : null,
          },
        ]}
        gridAutoColumns={CREDIT_GRANTS_GRID_AUTO_COLUMNS}
        footerButtonLabel={t`Grant credits`}
        onFooterButtonClick={onGrantCreditsClick}
      />

      <ConfirmationModal
        modalInstanceId={REVOKE_CREDIT_GRANT_MODAL_ID}
        title={t`Revoke credit grant`}
        subtitle={
          isDefined(grantPendingRevocation)
            ? t`This takes ${formatCredits(grantPendingRevocation.amount)} credits back off this workspace straight away. Revoking cannot be undone.`
            : ''
        }
        confirmButtonText={t`Revoke`}
        loading={isRevoking}
        onConfirmClick={() => {
          if (isDefined(grantPendingRevocation)) {
            handleRevoke(grantPendingRevocation.id);
          }
        }}
        onClose={() => setGrantPendingRevocation(null)}
      />
    </>
  );
};
