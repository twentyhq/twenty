import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useInstallMarketplaceApp } from '~/modules/marketplace/hooks/useInstallMarketplaceApp';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconArrowRight,
  IconBox,
  IconCheck,
  IconDownload,
  IconTag,
  IconTextCaption,
  IconTrash,
  IconWorld,
  Status,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import {
  ApplicationRegistrationSourceType,
  FindManyApplicationsDocument,
  UninstallApplicationDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  StyledAppModal,
  StyledAppModalButton,
  StyledAppModalSection,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';

const DELETE_REGISTRATION_MODAL_ID = 'delete-application-registration-modal';
const TRANSFER_OWNERSHIP_MODAL_ID =
  'transfer-application-registration-ownership-modal';
const UNINSTALL_APPLICATION_MODAL_ID =
  'uninstall-application-from-registration-modal';

const StyledVariableRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledVariableInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledVariableKey = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: monospace;
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledVariableDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDangerButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSourceRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDownloadLink = styled.a`
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type ServerVariable = {
  id: string;
  key: string;
  description: string;
  isSecret: boolean;
  isRequired: boolean;
  isFilled: boolean;
};

export const SettingsApplicationRegistrationGeneralTab = ({
  registration,
  hasActiveInstalls,
}: {
  registration: ApplicationRegistrationData;
  hasActiveInstalls: boolean;
}) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();

  const [isInstalling, setIsInstalling] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSubdomain, setTransferSubdomain] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );

  const applicationRegistrationId = registration.id;

  const { data: variablesData } = useQuery(
    FIND_APPLICATION_REGISTRATION_VARIABLES,
    {
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const { data: tarballUrlData } = useQuery(
    APPLICATION_REGISTRATION_TARBALL_URL,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const [deleteRegistration] = useMutation(DELETE_APPLICATION_REGISTRATION, {
    refetchQueries: [FIND_MANY_APPLICATION_REGISTRATIONS],
  });

  const [updateVariable] = useMutation(
    UPDATE_APPLICATION_REGISTRATION_VARIABLE,
    {
      refetchQueries: [FIND_APPLICATION_REGISTRATION_VARIABLES],
    },
  );

  const [transferOwnership] = useMutation(
    TRANSFER_APPLICATION_REGISTRATION_OWNERSHIP,
    {
      refetchQueries: [FIND_MANY_APPLICATION_REGISTRATIONS],
    },
  );

  const { install } = useInstallMarketplaceApp();
  const [uninstallApplication] = useMutation(UninstallApplicationDocument);
  const { data: applicationsData, refetch: refetchApplications } =
    useQuery(FindManyApplicationsDocument);

  const variables: ServerVariable[] =
    variablesData?.findApplicationRegistrationVariables ?? [];

  const isNpmSource =
    registration.sourceType === ApplicationRegistrationSourceType.NPM;

  const installedApp = (applicationsData?.findManyApplications ?? []).find(
    (application) =>
      application.universalIdentifier === registration.universalIdentifier,
  );

  const isInstalledOnWorkspace = isDefined(installedApp);

  const installedAppUrl = isInstalledOnWorkspace
    ? getSettingsPath(SettingsPath.ApplicationDetail, {
        applicationId: installedApp.id,
      })
    : undefined;

  const handleInstallOnWorkspace = async () => {
    setIsInstalling(true);
    try {
      const success = await install({
        universalIdentifier: registration.universalIdentifier,
      });

      if (success) {
        await refetchApplications();
        enqueueSuccessSnackBar({
          message: t`App installed on this workspace`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error installing app`,
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUninstallFromWorkspace = async () => {
    setIsUninstalling(true);
    try {
      await uninstallApplication({
        variables: {
          universalIdentifier: registration.universalIdentifier,
        },
      });
      await refetchApplications();
      enqueueSuccessSnackBar({
        message: t`Application uninstalled from this workspace`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error uninstalling application`,
      });
    } finally {
      setIsUninstalling(false);
    }
  };

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

  const handleSaveVariableValue = async (variable: ServerVariable) => {
    const value = variableValues[variable.id];
    const variableKey = variable.key;

    if (!isNonEmptyString(value)) {
      return;
    }

    try {
      await updateVariable({
        variables: {
          input: {
            id: variable.id,
            update: {
              value,
            },
          },
        },
      });
      setVariableValues((previous) => {
        const next = { ...previous };

        delete next[variable.id];

        return next;
      });
      enqueueSuccessSnackBar({
        message: t`Variable ${variableKey} updated`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error updating variable`,
      });
    }
  };

  const confirmationValue = t`yes`;

  const generalItems = [
    {
      Icon: IconTag,
      label: t`Name`,
      value: registration.name,
    },
    ...(isNonEmptyString(registration.description)
      ? [
          {
            Icon: IconTextCaption,
            label: t`Description`,
            value: registration.description,
          },
        ]
      : []),
    {
      Icon: IconWorld,
      label: t`Universal ID`,
      value: registration.universalIdentifier,
    },
    ...(isNpmSource && isNonEmptyString(registration.sourcePackage)
      ? [
          {
            Icon: IconBox,
            label: t`Package`,
            value: registration.sourcePackage,
          },
        ]
      : registration.sourceType === ApplicationRegistrationSourceType.TARBALL
        ? [
            {
              Icon: IconBox,
              label: t`Source`,
              value: isNonEmptyString(
                tarballUrlData?.applicationRegistrationTarballUrl,
              ) ? (
                <StyledSourceRow>
                  <span>
                    <Trans>Tarball upload</Trans>
                  </span>
                  <StyledDownloadLink
                    href={tarballUrlData.applicationRegistrationTarballUrl}
                    download
                  >
                    <Trans>Download</Trans>
                  </StyledDownloadLink>
                </StyledSourceRow>
              ) : (
                t`Tarball upload`
              ),
            },
          ]
        : registration.sourceType === ApplicationRegistrationSourceType.LOCAL
          ? [
              {
                Icon: IconBox,
                label: t`Source`,
                value: t`Local development`,
              },
            ]
          : []),
  ];

  return (
    <>
      <Section>
        <H2Title
          title={t`General`}
          description={t`Name and description are managed via your app manifest (CLI)`}
        />
        <SettingsAdminTableCard
          rounded
          items={generalItems}
          gridAutoColumns="3fr 8fr"
        />
      </Section>

      <Section>
        <H2Title
          title={t`Installation`}
          description={
            isInstalledOnWorkspace
              ? t`This app is installed on the current workspace`
              : t`Install this app on the current workspace`
          }
        />
        {isInstalledOnWorkspace ? (
          <StyledButtonGroup>
            <Button
              Icon={IconArrowRight}
              title={t`View installed app`}
              variant="primary"
              accent="blue"
              to={installedAppUrl}
            />
            <Button
              Icon={IconTrash}
              title={t`Uninstall`}
              variant="secondary"
              accent="danger"
              onClick={() => openModal(UNINSTALL_APPLICATION_MODAL_ID)}
            />
          </StyledButtonGroup>
        ) : (
          <Button
            Icon={IconDownload}
            title={
              isInstalling ? t`Installing...` : t`Install on this workspace`
            }
            variant="secondary"
            accent="blue"
            disabled={isInstalling}
            onClick={handleInstallOnWorkspace}
          />
        )}
      </Section>

      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalInstanceId={UNINSTALL_APPLICATION_MODAL_ID}
        title={t`Uninstall Application?`}
        subtitle={
          <Trans>
            This will remove the application and all its data from this
            workspace. Please type {`"${confirmationValue}"`} to confirm.
          </Trans>
        }
        onConfirmClick={handleUninstallFromWorkspace}
        confirmButtonText={t`Uninstall`}
        loading={isUninstalling}
      />

      {variables.length > 0 && (
        <Section>
          <H2Title
            title={t`Server Variables`}
            description={t`Variables declared by the app manifest. Fill in values here — they apply to all workspace installations.`}
          />
          {variables.map((variable) => (
            <StyledVariableRow key={variable.id}>
              <StyledVariableInfo>
                <StyledVariableKey>
                  {variable.key}
                  {variable.isRequired && (
                    <span style={{ color: 'red' }}> *</span>
                  )}
                </StyledVariableKey>
                {isNonEmptyString(variable.description) && (
                  <StyledVariableDescription>
                    {variable.description}
                  </StyledVariableDescription>
                )}
              </StyledVariableInfo>
              {variable.isFilled &&
                !isNonEmptyString(variableValues[variable.id]) && (
                  <Status color="green" text={t`Configured`} />
                )}
              {!variable.isFilled &&
                !isNonEmptyString(variableValues[variable.id]) && (
                  <Status
                    color={variable.isRequired ? 'red' : 'gray'}
                    text={variable.isRequired ? t`Required` : t`Not set`}
                  />
                )}
              <SettingsTextInput
                instanceId={`var-${variable.id}`}
                value={variableValues[variable.id] ?? ''}
                onChange={(value) =>
                  setVariableValues((previous) => ({
                    ...previous,
                    [variable.id]: value,
                  }))
                }
                placeholder={
                  variable.isSecret ? t`Enter secret value` : t`Enter value`
                }
                fullWidth
              />
              <Button
                Icon={IconCheck}
                variant="secondary"
                size="small"
                disabled={!isNonEmptyString(variableValues[variable.id])}
                onClick={() => handleSaveVariableValue(variable)}
              />
            </StyledVariableRow>
          ))}
        </Section>
      )}

      <Section>
        <H2Title
          title={t`Danger zone`}
          description={
            hasActiveInstalls
              ? t`Uninstall this app from all workspaces before deleting it`
              : t`Delete or transfer this app registration`
          }
        />
        <StyledDangerButtonGroup>
          <Button
            accent="danger"
            variant="secondary"
            title={t`Delete`}
            Icon={IconTrash}
            disabled={hasActiveInstalls}
            onClick={() => openModal(DELETE_REGISTRATION_MODAL_ID)}
          />
          <Button
            accent="default"
            variant="secondary"
            title={t`Transfer ownership`}
            Icon={IconArrowRight}
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
