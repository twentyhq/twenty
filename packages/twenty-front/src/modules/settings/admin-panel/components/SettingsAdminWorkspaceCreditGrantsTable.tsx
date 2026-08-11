import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { IconTrash } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { Card } from 'twenty-ui/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CREDIT_GRANT_TYPE_COLORS } from '@/settings/admin-panel/constants/CreditGrantTypeColors';
import { CREDIT_GRANT_TYPE_LABELS } from '@/settings/admin-panel/constants/CreditGrantTypeLabels';
import { REVOKE_WORKSPACE_CREDIT_GRANT } from '@/settings/admin-panel/graphql/mutations/revokeWorkspaceCreditGrant';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyExactDate } from '~/utils/date-utils';
import { type WorkspaceBillingAdminPanelQuery } from '~/generated-admin/graphql';

type CreditGrant = NonNullable<
  WorkspaceBillingAdminPanelQuery['workspaceBillingAdminPanel']
>['creditGrants'][number];

type SettingsAdminWorkspaceCreditGrantsTableProps = {
  workspaceId: string;
  creditGrants: CreditGrant[];
};

const GRID_AUTO_COLUMNS = '1fr 1.4fr 1fr 1.6fr 2fr 32px';
const REVOKE_CREDIT_GRANT_MODAL_ID = 'revoke-credit-grant-modal';

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledReason = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

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
}: SettingsAdminWorkspaceCreditGrantsTableProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const apolloAdminClient = useApolloAdminClient();
  const { openModal } = useModal();

  const [grantPendingRevocation, setGrantPendingRevocation] =
    useState<CreditGrant | null>(null);
  const [revokingGrantId, setRevokingGrantId] = useState<string | null>(null);

  const [revokeWorkspaceCreditGrant] = useMutation(
    REVOKE_WORKSPACE_CREDIT_GRANT,
    {
      client: apolloAdminClient,
      refetchQueries: [GET_WORKSPACE_BILLING_ADMIN_PANEL],
    },
  );

  const handleRevokeClick = (creditGrant: CreditGrant) => {
    setGrantPendingRevocation(creditGrant);
    openModal(REVOKE_CREDIT_GRANT_MODAL_ID);
  };

  const handleRevoke = async (creditGrantId: string) => {
    // The refetch that clears the row lands well after the mutation resolves,
    // so without this the button stays live and a second click revokes an
    // already revoked grant.
    setRevokingGrantId(creditGrantId);

    try {
      await revokeWorkspaceCreditGrant({
        variables: { workspaceId, creditGrantId },
      });

      enqueueSuccessSnackBar({ message: t`Credit grant revoked.` });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not revoke this credit grant.`,
      });
    } finally {
      setRevokingGrantId(null);
      setGrantPendingRevocation(null);
    }
  };

  if (creditGrants.length === 0) {
    return (
      <Card rounded>
        <StyledEmptyState>
          {t`No credits have been granted to this workspace.`}
        </StyledEmptyState>
      </Card>
    );
  }

  return (
    <Card rounded>
      <Table>
        <TableRow gridAutoColumns={GRID_AUTO_COLUMNS}>
          <TableHeader>{t`Amount`}</TableHeader>
          <TableHeader>{t`Type`}</TableHeader>
          <TableHeader>{t`Status`}</TableHeader>
          <TableHeader>{t`Expires`}</TableHeader>
          <TableHeader>{t`Reason`}</TableHeader>
          <TableHeader></TableHeader>
        </TableRow>
        <TableBody>
          {creditGrants.map((creditGrant) => {
            const status = getStatus(creditGrant);

            return (
              <TableRow
                key={creditGrant.id}
                gridAutoColumns={GRID_AUTO_COLUMNS}
              >
                <TableCell>
                  {formatNumber(creditGrant.amount, { decimals: 2 })}
                </TableCell>
                <TableCell>
                  <Tag
                    color={CREDIT_GRANT_TYPE_COLORS[creditGrant.type]}
                    text={t(CREDIT_GRANT_TYPE_LABELS[creditGrant.type])}
                  />
                </TableCell>
                <TableCell>
                  <Tag color={status.color} text={t(status.label)} />
                </TableCell>
                <TableCell>
                  {beautifyExactDate(creditGrant.expiresAt)}
                </TableCell>
                <TableCell>
                  <StyledReason>{creditGrant.reason ?? '—'}</StyledReason>
                </TableCell>
                <TableCell>
                  {creditGrant.isActive && (
                    <IconButton
                      Icon={IconTrash}
                      size="small"
                      accent="danger"
                      disabled={isDefined(revokingGrantId)}
                      onClick={() => handleRevokeClick(creditGrant)}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ConfirmationModal
        modalInstanceId={REVOKE_CREDIT_GRANT_MODAL_ID}
        title={t`Revoke credit grant`}
        subtitle={
          isDefined(grantPendingRevocation)
            ? t`This takes ${formatNumber(grantPendingRevocation.amount, {
                decimals: 2,
              })} credits back off this workspace straight away. Revoking cannot be undone.`
            : ''
        }
        confirmButtonText={t`Revoke`}
        loading={isDefined(revokingGrantId)}
        onConfirmClick={() => {
          if (isDefined(grantPendingRevocation)) {
            handleRevoke(grantPendingRevocation.id);
          }
        }}
        onClose={() => setGrantPendingRevocation(null)}
      />
    </Card>
  );
};
