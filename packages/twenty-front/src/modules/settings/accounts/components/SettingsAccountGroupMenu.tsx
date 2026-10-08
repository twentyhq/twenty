import { SettingsAccountGroupImpact } from '@/settings/accounts/components/SettingsAccountGroupImpact';
import { useConnectedAccountAdministration } from '@/settings/accounts/hooks/useConnectedAccountAdministration';
import { useConnectedAccountGroupLifecycle } from '@/settings/accounts/hooks/useConnectedAccountGroupLifecycle';
import { type ConnectedAccountGroup } from '@/settings/accounts/types/ConnectedAccountGroup';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconAt,
  IconDotsVertical,
  IconTrash,
  IconUnlink,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledActionError = styled.div`
  grid-column: 1 / -1;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsAccountGroupMenuProps = {
  group: ConnectedAccountGroup;
  scope?: 'group' | 'connection';
};

export const SettingsAccountGroupMenu = ({
  group,
  scope = 'group',
}: SettingsAccountGroupMenuProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const { canManageAccount } = useConnectedAccountAdministration();
  const {
    executeGroupAction,
    beginGroupAction,
    resetGroupAction,
    lastOperation,
    completedIds,
    failedIds,
    hasRefreshError,
    loading,
  } = useConnectedAccountGroupLifecycle();
  const deleteModalId = `delete-account-${scope}-${group.id}`;
  const disconnectModalId = `disconnect-account-${scope}-${group.id}`;
  const accounts = group.accounts.filter(
    (account) => !completedIds.delete.has(account.id),
  );
  const canDelete = accounts.some((account) => canManageAccount(account));
  const canDisconnect = accounts.some(
    (account) => canManageAccount(account) && !isDefined(account.archivedAt),
  );
  const handleOpenConfirmation = ({
    operation,
    isRetry = false,
  }: {
    operation: 'delete' | 'disconnect';
    isRetry?: boolean;
  }) => {
    beginGroupAction({ operation, isRetry });
    openDialog(operation === 'delete' ? deleteModalId : disconnectModalId);
  };

  return (
    <>
      <DropdownRoot type="menu" dropdownId={`account-group-menu-${group.id}`}>
        <Dropdown.Trigger
          render={
            <LightIconButton
              emphasis="subtle"
              aria-label={t`More options for ${group.handle}`}
              disabled={loading}
            >
              <IconDotsVertical />
            </LightIconButton>
          }
        />
        <DropdownContent side="right" align="start">
          <Dropdown.Section>
            {scope === 'group' && (
              <Dropdown.ActionItem
                startIcon={<IconAt />}
                render={
                  <Link
                    to={getSettingsPath(SettingsPath.AccountDetail, {
                      accountGroupId: group.id,
                    })}
                  />
                }
              >{t`Account settings`}</Dropdown.ActionItem>
            )}
            {canDisconnect && (
              <Dropdown.ActionItem
                startIcon={<IconUnlink />}
                onClick={() =>
                  handleOpenConfirmation({ operation: 'disconnect' })
                }
              >
                {scope === 'group'
                  ? t`Disconnect account`
                  : t`Disconnect connection`}
              </Dropdown.ActionItem>
            )}
            {canDelete && (
              <Dropdown.ActionItem
                color="danger"
                startIcon={<IconTrash />}
                onClick={() => handleOpenConfirmation({ operation: 'delete' })}
              >
                {scope === 'group'
                  ? t`Delete account and synced data`
                  : t`Delete connection`}
              </Dropdown.ActionItem>
            )}
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      <ConfirmationDialog
        dialogId={disconnectModalId}
        title={
          scope === 'group' ? t`Disconnect account` : t`Disconnect connection`
        }
        subtitle={
          <SettingsAccountGroupImpact
            accounts={accounts}
            operation="disconnect"
          />
        }
        onConfirmClick={() =>
          executeGroupAction({ accounts, operation: 'disconnect' })
        }
        onClose={resetGroupAction}
        confirmButtonText={
          scope === 'group' ? t`Disconnect account` : t`Disconnect connection`
        }
        loading={loading}
      />
      <ConfirmationDialog
        dialogId={deleteModalId}
        title={
          scope === 'group'
            ? t`Delete account and synced data?`
            : t`Delete connection?`
        }
        subtitle={
          <SettingsAccountGroupImpact accounts={accounts} operation="delete" />
        }
        onConfirmClick={() =>
          executeGroupAction({ accounts, operation: 'delete' })
        }
        onClose={resetGroupAction}
        confirmButtonText={
          scope === 'group' ? t`Delete account and data` : t`Delete connection`
        }
        loading={loading}
      />
      {(failedIds.length > 0 || hasRefreshError) && (
        <StyledActionError>
          <InlineBanner status="error" layout="compact">
            {failedIds.length > 0
              ? t`Some connections could not be updated. Retry to update the remaining connections.`
              : t`Connections were updated, but refreshing failed. Reload to check their status.`}
          </InlineBanner>
          {failedIds.length > 0 && isDefined(lastOperation) && (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() =>
                handleOpenConfirmation({
                  operation: lastOperation,
                  isRetry: true,
                })
              }
            >{t`Retry`}</Button>
          )}
        </StyledActionError>
      )}
    </>
  );
};
