import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import {
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconShare,
  IconTrash,
  AppTooltip,
  TooltipDelay,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import {
  type ApplicationRegistration,
  DeleteApplicationRegistrationDocument,
  FindApplicationRegistrationStatsDocument,
  FindManyApplicationRegistrationsDocument,
  TransferApplicationRegistrationOwnershipDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  StyledAppModal,
  StyledAppModalButton,
  StyledAppModalSection,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';
import { SettingsAdminApplicationRegistrationDetailContent } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationDetailContent';
import { isDefined } from 'twenty-shared/utils';

const DELETE_REGISTRATION_MODAL_ID = 'delete-application-registration-modal';

const TRANSFER_OWNERSHIP_MODAL_ID =
  'transfer-application-registration-ownership-modal';

const DELETE_REGISTRATION_BUTTON_ID = 'delete-registration-button';

const StyledDangerButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationGeneralTab = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();

  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSubdomain, setTransferSubdomain] = useState('');

  const applicationRegistrationId = registration.id;

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

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteRegistration({
        variables: { id: applicationRegistrationId },
      });
      navigate(SettingsPath.Applications);
    } catch {
      enqueueErrorSnackBar({
        message: t`Error deleting app`,
      });
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
      enqueueSuccessSnackBar({
        message: t`Ownership transferred successfully`,
      });
      setTransferSubdomain('');
      navigate(SettingsPath.Applications);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to transfer ownership. Check that the subdomain is correct.`,
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const confirmationValue = t`yes`;

  return (
    <>
      <SettingsAdminApplicationRegistrationDetailContent
        registration={registration}
      />
      <Section>
        <H2Title
          title={t`Danger zone`}
          description={t`Delete or transfer this app registration`}
        />
        <StyledDangerButtonGroup>
          <Button
            id={DELETE_REGISTRATION_BUTTON_ID}
            accent="danger"
            variant="secondary"
            title={t`Delete app`}
            Icon={IconTrash}
            disabled={hasActiveInstalls}
            onClick={() => openModal(DELETE_REGISTRATION_MODAL_ID)}
          />
          {hasActiveInstalls && (
            <AppTooltip
              anchorSelect={`#${DELETE_REGISTRATION_BUTTON_ID}`}
              content={t`Uninstall this app from all workspaces before deleting it`}
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          )}
          <Button
            accent="default"
            variant="secondary"
            title={t`Transfer ownership`}
            Icon={IconShare}
            onClick={() => openModal(TRANSFER_OWNERSHIP_MODAL_ID)}
          />
        </StyledDangerButtonGroup>
      </Section>

      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalInstanceId={DELETE_REGISTRATION_MODAL_ID}
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

      <StyledAppModal
        modalId={TRANSFER_OWNERSHIP_MODAL_ID}
        isClosable
        onClose={() => setTransferSubdomain('')}
        padding="large"
        dataGloballyPreventClickOutside
      >
        <StyledAppModalTitle>
          <H1Title
            title={t`Transfer ownership`}
            fontColor={H1TitleFontColor.Primary}
          />
        </StyledAppModalTitle>
        <StyledAppModalSection
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Enter the workspace subdomain to transfer this app to. You will lose access to manage it.`}
        </StyledAppModalSection>
        <Section>
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
        </Section>
        <StyledAppModalButton
          onClick={() => {
            closeModal(TRANSFER_OWNERSHIP_MODAL_ID);
            setTransferSubdomain('');
          }}
          variant="secondary"
          title={t`Cancel`}
          fullWidth
        />
        <StyledAppModalButton
          onClick={handleTransferOwnership}
          variant="secondary"
          accent="danger"
          title={t`Transfer`}
          disabled={
            !isNonEmptyString(transferSubdomain.trim()) || isTransferring
          }
          fullWidth
        />
      </StyledAppModal>
    </>
  );
};
