import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconShare, IconTrash, IconUserPlus } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog, Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type ApplicationRegistration,
  ClaimApplicationRegistrationOwnershipDocument,
  DeleteApplicationRegistrationDocument,
  FindApplicationRegistrationStatsDocument,
  FindManyApplicationRegistrationsDocument,
  TransferApplicationRegistrationOwnershipDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_REGISTRATION_MODAL_ID = 'delete-application-registration-modal';

const TRANSFER_OWNERSHIP_MODAL_ID =
  'transfer-application-registration-ownership-modal';

const CLAIM_OWNERSHIP_MODAL_ID =
  'claim-application-registration-ownership-modal';

const DELETE_REGISTRATION_BUTTON_ID = 'delete-registration-button';

const StyledActionButton = styled(Button)`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledDescriptionSection = styled(Section.Root)`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledDangerButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminApplicationRegistrationDangerZone = ({
  registration,
  fromAdmin = false,
}: {
  registration: ApplicationRegistration;
  fromAdmin?: boolean;
}) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const { openDialog, closeDialog } = useDialog();

  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [transferSubdomain, setTransferSubdomain] = useState('');

  const applicationRegistrationId = registration.id;

  const isUnclaimed = !isDefined(registration.ownerWorkspaceId);

  const { data: statsData } = useQuery(
    FindApplicationRegistrationStatsDocument,
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

      if (fromAdmin) {
        navigate(
          SettingsPath.AdminPanel,
          undefined,
          undefined,
          undefined,
          '#app',
        );
      } else {
        navigate(
          SettingsPath.Applications,
          undefined,
          undefined,
          undefined,
          '#developer',
        );
      }

      enqueueToast({
        variant: 'success',
        children: t`App deleted successfully`,
      });
    } catch {
      enqueueToast({ variant: 'error', children: t`Error deleting app` });
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
        variant: 'success',
        children: t`Ownership transferred successfully`,
      });
      setTransferSubdomain('');
      navigate(SettingsPath.Applications);
    } catch {
      enqueueToast({
        variant: 'error',
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
      enqueueToast({
        variant: 'success',
        children: t`Ownership claimed successfully`,
      });
      closeDialog(CLAIM_OWNERSHIP_MODAL_ID);
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to claim ownership.`,
      });
    } finally {
      setIsClaiming(false);
    }
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
            ? fromAdmin && (
                <Button
                  startIcon={<IconUserPlus />}
                  onClick={() => openDialog(CLAIM_OWNERSHIP_MODAL_ID)}
                  variant="outline"
                >{t`Claim ownership`}</Button>
              )
            : !isUnclaimed && (
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
        dialogId={CLAIM_OWNERSHIP_MODAL_ID}
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
        {({ container, backdrop, viewportProps, onKeyDown }) => (
          <Dialog.Popup
            {...{ container, backdrop, viewportProps, onKeyDown }}
            data-globally-prevent-click-outside
            style={{
              padding: 'var(--t-spacing-6)',
              borderRadius: 'var(--t-spacing-1)',
              width: 'calc(400px - var(--t-spacing-32))',
            }}
          >
            <Dialog.Title>{t`Transfer ownership`}</Dialog.Title>
            <StyledDescriptionSection align="center" color="primary">
              {t`Enter the workspace subdomain to transfer this app to. You will lose access to manage it.`}
            </StyledDescriptionSection>
            <Section.Root>
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
            </Section.Root>
            <StyledActionButton
              onClick={() => {
                closeDialog(TRANSFER_OWNERSHIP_MODAL_ID);
                setTransferSubdomain('');
              }}
              fullWidth
              variant="outline"
            >{t`Cancel`}</StyledActionButton>
            <StyledActionButton
              onClick={handleTransferOwnership}
              disabled={
                !isNonEmptyString(transferSubdomain.trim()) || isTransferring
              }
              fullWidth
              variant="outline"
              color="danger"
            >{t`Transfer`}</StyledActionButton>
          </Dialog.Popup>
        )}
      </DialogInstance>
    </>
  );
};
