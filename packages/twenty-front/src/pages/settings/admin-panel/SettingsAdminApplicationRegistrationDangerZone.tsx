import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID } from '@/settings/admin-panel/apps/constants/ClaimApplicationRegistrationOwnershipModalId';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconShare, IconTrash, IconUserPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog, Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  type ApplicationRegistration,
  ClaimApplicationRegistrationOwnershipDocument,
  DeleteApplicationRegistrationDocument,
  FindApplicationRegistrationInstallCountDocument,
  FindManyApplicationRegistrationsDocument,
  PermissionFlagType,
  TransferApplicationRegistrationOwnershipDocument,
} from '~/generated-metadata/graphql';
import { FindOneAdminApplicationRegistrationDocument } from '~/generated-admin/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_REGISTRATION_MODAL_ID = 'delete-application-registration-modal';

const TRANSFER_OWNERSHIP_MODAL_ID =
  'transfer-application-registration-ownership-modal';

const DELETE_REGISTRATION_BUTTON_ID = 'delete-registration-button';

const StyledDangerButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminApplicationRegistrationDangerZone = ({
  registration,
  isAdminView = false,
}: {
  registration: ApplicationRegistration;
  isAdminView?: boolean;
}) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const { openDialog, closeDialog } = useDialog();
  const apolloAdminClient = useApolloAdminClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [transferSubdomain, setTransferSubdomain] = useState('');

  const applicationRegistrationId = registration.id;

  const isUnclaimed = !isDefined(registration.ownerWorkspaceId);
  const hasApplicationsPermission = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const { data: statsData } = useQuery(
    FindApplicationRegistrationInstallCountDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const stats = statsData?.findApplicationRegistrationStats;

  const hasActiveInstalls =
    !isDefined(stats) || (stats.activeInstalls ?? 0) > 0;

  const [deleteRegistration] = useMutation(
    DeleteApplicationRegistrationDocument,
    {
      refetchQueries: [FindManyApplicationRegistrationsDocument],
    },
  );

  const [transferOwnership] = useMutation(
    TransferApplicationRegistrationOwnershipDocument,
    {
      refetchQueries: [FindManyApplicationRegistrationsDocument],
    },
  );

  const [claimOwnership] = useMutation(
    ClaimApplicationRegistrationOwnershipDocument,
    {
      refetchQueries: [FindManyApplicationRegistrationsDocument],
    },
  );

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteRegistration({
        variables: { id: applicationRegistrationId },
      });

      if (isAdminView) {
        navigate(
          SettingsPath.AdminPanel,
          undefined,
          undefined,
          undefined,
          '#app',
        );
      } else {
        navigate(
          SettingsPath.Developers,
          undefined,
          undefined,
          undefined,
          `#${SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS}`,
        );
      }

      enqueueToast({
        status: 'success',
        children: t`App deleted successfully`,
      });
    } catch {
      enqueueToast({ status: 'error', children: t`Error deleting app` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    const trimmed = transferSubdomain.trim();

    if (!isNonEmptyString(trimmed)) {
      return;
    }

    setIsTransferring(true);
    try {
      await transferOwnership({
        variables: {
          applicationRegistrationId,
          targetWorkspaceSubdomain: trimmed,
        },
      });
      enqueueToast({
        status: 'success',
        children: t`Ownership transferred successfully`,
      });
      setTransferSubdomain('');
      navigate(SettingsPath.Applications);
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Failed to transfer ownership. Check that the subdomain is correct.`,
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClaimOwnership = async () => {
    setIsClaiming(true);
    try {
      await claimOwnership({
        variables: { applicationRegistrationId },
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Failed to claim ownership.`,
      });

      return;
    } finally {
      setIsClaiming(false);
    }

    enqueueToast({
      status: 'success',
      children: t`Ownership claimed successfully`,
    });
    closeDialog(CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID);

    await apolloAdminClient.refetchQueries({
      include: [FindOneAdminApplicationRegistrationDocument],
    });
  };

  const confirmationValue = t`yes`;

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Danger zone`}
          description={t`Delete or transfer this app registration`}
        />
        <StyledDangerButtonGroup>
          <Tooltip
            content={t`Uninstall this app from all workspaces before deleting it`}
            side="bottom"
            positionMethod="fixed"
            delay={TooltipDelay.shortDelay}
            disabled={!hasActiveInstalls}
          >
            <span tabIndex={hasActiveInstalls ? 0 : undefined}>
              <Button
                id={DELETE_REGISTRATION_BUTTON_ID}
                color="danger"
                variant="outline"
                startIcon={<IconTrash />}
                disabled={hasActiveInstalls}
                onClick={() => openDialog(DELETE_REGISTRATION_MODAL_ID)}
              >
                {t`Delete app`}
              </Button>
            </span>
          </Tooltip>

          {isUnclaimed
            ? isAdminView && (
                <Button
                  startIcon={<IconUserPlus />}
                  onClick={() =>
                    openDialog(
                      CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID,
                    )
                  }
                  variant="outline"
                >{t`Claim ownership`}</Button>
              )
            : hasApplicationsPermission && (
                <Button
                  startIcon={<IconShare />}
                  onClick={() => openDialog(TRANSFER_OWNERSHIP_MODAL_ID)}
                  variant="outline"
                >{t`Transfer ownership`}</Button>
              )}
        </StyledDangerButtonGroup>
      </Section.Root>

      <ConfirmationDialog
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        dialogId={DELETE_REGISTRATION_MODAL_ID}
        title={t`Delete app`}
        subtitle={
          <Trans>
            Please type {`"${confirmationValue}"`} to confirm you want to delete
            this app. All workspace installations linked to it will lose their
            OAuth credentials.
          </Trans>
        }
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        loading={isLoading}
      />

      <ConfirmationDialog
        dialogId={CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID}
        title={t`Claim ownership`}
        subtitle={
          <Trans>
            This app has no owner workspace. Claiming it will assign ownership
            to your current workspace, and you will be able to manage it.
          </Trans>
        }
        onConfirmClick={handleClaimOwnership}
        confirmButtonText={t`Claim`}
        confirmButtonColor="accent"
        loading={isClaiming}
      />

      <DialogInstance
        dialogId={TRANSFER_OWNERSHIP_MODAL_ID}
        dismissible
        onClose={() => setTransferSubdomain('')}
      >
        {({ onKeyDown }) => (
          <Dialog.Popup
            onKeyDown={onKeyDown}
            data-globally-prevent-click-outside
            size="sm"
          >
            <Dialog.Header>
              <Dialog.Title>{t`Transfer ownership`}</Dialog.Title>
              <Dialog.Description>
                {t`Enter the workspace subdomain to transfer this app to. You will lose access to manage it.`}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <SettingsTextInput
                instanceId="transfer-ownership-subdomain"
                value={transferSubdomain}
                onChange={setTransferSubdomain}
                placeholder={t`e.g. my-workspace`}
                fullWidth
                disableHotkeys
                label={t`Target workspace subdomain`}
                autoFocusOnMount
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => {
                  closeDialog(TRANSFER_OWNERSHIP_MODAL_ID);
                  setTransferSubdomain('');
                }}
                fullWidth
                variant="outline"
              >{t`Cancel`}</Button>
              <Button
                onClick={handleTransferOwnership}
                disabled={
                  !isNonEmptyString(transferSubdomain.trim()) || isTransferring
                }
                fullWidth
                variant="outline"
                color="danger"
              >{t`Transfer`}</Button>
            </Dialog.Footer>
          </Dialog.Popup>
        )}
      </DialogInstance>
    </>
  );
};
