import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { DELETE_APPLICATION_REGISTRATION } from '@/settings/application-registrations/graphql/mutations/deleteApplicationRegistration';
import { ROTATE_APPLICATION_REGISTRATION_CLIENT_SECRET } from '@/settings/application-registrations/graphql/mutations/rotateApplicationRegistrationClientSecret';
import { TRANSFER_APPLICATION_REGISTRATION_OWNERSHIP } from '@/settings/application-registrations/graphql/mutations/transferApplicationRegistrationOwnership';
import { UPDATE_APPLICATION_REGISTRATION } from '@/settings/application-registrations/graphql/mutations/updateApplicationRegistration';
import { UPDATE_APPLICATION_REGISTRATION_VARIABLE } from '@/settings/application-registrations/graphql/mutations/updateApplicationRegistrationVariable';
import { APPLICATION_REGISTRATION_TARBALL_URL } from '@/settings/application-registrations/graphql/queries/applicationRegistrationTarballUrl';
import { FIND_APPLICATION_REGISTRATION_STATS } from '@/settings/application-registrations/graphql/queries/findApplicationRegistrationStats';
import { FIND_APPLICATION_REGISTRATION_VARIABLES } from '@/settings/application-registrations/graphql/queries/findApplicationRegistrationVariables';
import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { FIND_ONE_APPLICATION_REGISTRATION } from '@/settings/application-registrations/graphql/queries/findOneApplicationRegistration';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useInstallMarketplaceApp } from '~/modules/marketplace/hooks/useInstallMarketplaceApp';
import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined, isValidUrl } from 'twenty-shared/utils';
import {
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconBox,
  IconDownload,
  IconExternalLink,
  IconKey,
  IconRefresh,
  IconShield,
  IconTag,
  IconTextCaption,
  IconTrash,
  IconWorld,
  Status,
} from 'twenty-ui/display';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { Button } from 'twenty-ui/input';
import {
  Card,
  Section,
  SectionAlignment,
  SectionFontColor,
} from 'twenty-ui/layout';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import {
  ApplicationRegistrationSourceType,
  useFindManyApplicationsQuery,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  StyledAppModal,
  StyledAppModalButton,
  StyledAppModalSection,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';
import { applicationRegistrationClientSecretFamilyState } from '~/pages/settings/applications/states/applicationRegistrationClientSecretFamilyState';

const DELETE_REGISTRATION_MODAL_ID = 'delete-application-registration-modal';
const ROTATE_SECRET_MODAL_ID = 'rotate-application-registration-secret-modal';
const TRANSFER_OWNERSHIP_MODAL_ID =
  'transfer-application-registration-ownership-modal';

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledRedirectUriRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledRedirectUriValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: monospace;
  word-break: break-all;
`;

const StyledVariableRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledVariableInfo = styled.div`
  flex: 1;
  display: flex;
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

const StyledRotateContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
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

const StyledMarketplaceActions = styled.div`
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

export const SettingsApplicationRegistrationDetails = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { copyToClipboard } = useCopyToClipboard();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();
  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const applicationRegistrationClientSecret = useAtomFamilyStateValue(
    applicationRegistrationClientSecretFamilyState,
    applicationRegistrationId,
  );

  const [isInstalling, setIsInstalling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formRedirectUris, setFormRedirectUris] = useState<string[]>([]);
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null);
  const [transferSubdomain, setTransferSubdomain] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );

  const { data, loading } = useQuery(FIND_ONE_APPLICATION_REGISTRATION, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
    onCompleted: (result) => {
      const foundRegistration = result?.findOneApplicationRegistration;

      if (isDefined(foundRegistration)) {
        setFormRedirectUris(foundRegistration.oAuthRedirectUris ?? []);
      }
    },
  });

  const { data: variablesData } = useQuery(
    FIND_APPLICATION_REGISTRATION_VARIABLES,
    {
      variables: { applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const { data: statsData } = useQuery(FIND_APPLICATION_REGISTRATION_STATS, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const { data: tarballUrlData } = useQuery(
    APPLICATION_REGISTRATION_TARBALL_URL,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const [updateRegistration] = useMutation(UPDATE_APPLICATION_REGISTRATION, {
    refetchQueries: [
      FIND_ONE_APPLICATION_REGISTRATION,
      FIND_MANY_APPLICATION_REGISTRATIONS,
    ],
  });
  const [deleteRegistration] = useMutation(DELETE_APPLICATION_REGISTRATION, {
    refetchQueries: [FIND_MANY_APPLICATION_REGISTRATIONS],
  });
  const [rotateSecret] = useMutation(
    ROTATE_APPLICATION_REGISTRATION_CLIENT_SECRET,
  );
  const [updateVariable] = useMutation(
    UPDATE_APPLICATION_REGISTRATION_VARIABLE,
    {
      refetchQueries: [FIND_APPLICATION_REGISTRATION_VARIABLES],
    },
  );
  const [transferOwnership] = useMutation(
    TRANSFER_APPLICATION_REGISTRATION_OWNERSHIP,
    {
      refetchQueries: [
        FIND_ONE_APPLICATION_REGISTRATION,
        FIND_MANY_APPLICATION_REGISTRATIONS,
      ],
    },
  );

  const { install } = useInstallMarketplaceApp();
  const { data: applicationsData, refetch: refetchApplications } =
    useFindManyApplicationsQuery();

  const registration = data?.findOneApplicationRegistration;
  const variables: ServerVariable[] =
    variablesData?.findApplicationRegistrationVariables ?? [];

  const isNpmSource =
    registration?.sourceType === ApplicationRegistrationSourceType.NPM;

  if (loading || !registration) {
    return null;
  }

  const isInstalledOnWorkspace = (
    applicationsData?.findManyApplications ?? []
  ).some(
    (application) =>
      application.universalIdentifier === registration.universalIdentifier,
  );

  const handleToggleListed = async () => {
    try {
      await updateRegistration({
        variables: {
          input: {
            id: applicationRegistrationId,
            update: {
              isListed: !registration.isListed,
            },
          },
        },
      });
      enqueueSuccessSnackBar({
        message: registration.isListed
          ? t`App removed from marketplace`
          : t`App listed on marketplace`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error updating marketplace listing`,
      });
    }
  };

  const marketplacePageUrl = getSettingsPath(
    SettingsPath.AvailableApplicationDetail,
    {
      availableApplicationId: registration.universalIdentifier,
    },
  );

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

  const markDirty = () => setHasChanges(true);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateRegistration({
        variables: {
          input: {
            id: applicationRegistrationId,
            update: {
              oAuthRedirectUris: formRedirectUris,
            },
          },
        },
      });
      setHasChanges(false);
      enqueueSuccessSnackBar({ message: t`App updated` });
    } catch {
      enqueueErrorSnackBar({ message: t`Error updating app` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormRedirectUris(registration.oAuthRedirectUris ?? []);
    setHasChanges(false);
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

  const handleRotateSecret = async () => {
    setIsLoading(true);
    try {
      const result = await rotateSecret({
        variables: { id: applicationRegistrationId },
      });
      const secret =
        result.data?.rotateApplicationRegistrationClientSecret?.clientSecret;

      if (isNonEmptyString(secret)) {
        setRotatedSecret(secret);
        enqueueSuccessSnackBar({
          message: t`Client secret rotated. Copy it now — it won't be shown again.`,
        });
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Error rotating client secret`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRedirectUri = () => {
    const trimmed = newRedirectUri.trim();

    if (!trimmed) {
      return;
    }

    if (!isValidUrl(trimmed)) {
      enqueueErrorSnackBar({ message: t`Please enter a valid URL` });

      return;
    }

    if (formRedirectUris.includes(trimmed)) {
      enqueueErrorSnackBar({ message: t`This redirect URI is already added` });

      return;
    }

    setFormRedirectUris([...formRedirectUris, trimmed]);
    setNewRedirectUri('');
    markDirty();
  };

  const handleRemoveRedirectUri = (index: number) => {
    setFormRedirectUris(
      formRedirectUris.filter((_, uriIndex) => uriIndex !== index),
    );
    markDirty();
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

  const displayedSecret = applicationRegistrationClientSecret ?? rotatedSecret;
  const confirmationValue = t`yes`;

  const credentialItems = [
    {
      Icon: IconKey,
      label: t`Client ID`,
      value: registration.oAuthClientId,
      onClick: () =>
        copyToClipboard(registration.oAuthClientId, t`Client ID copied`),
    },
    {
      Icon: IconShield,
      label: t`Scopes`,
      value: (registration.oAuthScopes ?? []).join(', ') || '—',
    },
  ];

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
      onClick: () =>
        copyToClipboard(
          registration.universalIdentifier,
          t`Universal identifier copied`,
        ),
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

  const stats = statsData?.findApplicationRegistrationStats;
  const hasActiveInstalls = (stats?.activeInstalls ?? 0) > 0;

  const versionDistributionLabel =
    stats?.versionDistribution
      ?.map(
        (entry: { version: string; count: number }) =>
          `${entry.version} (${entry.count})`,
      )
      .join(', ') || '—';

  const statsItems = [
    {
      Icon: IconDownload,
      label: t`Active installs`,
      value: stats?.activeInstalls ?? '—',
    },
    {
      Icon: IconTag,
      label: t`Most installed version`,
      value: stats?.mostInstalledVersion ?? '—',
    },
    {
      Icon: IconChartBar,
      label: t`Distribution`,
      value: versionDistributionLabel,
    },
  ];

  return (
    <>
      <SubMenuTopBarContainer
        title={registration.name}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          { children: registration.name },
        ]}
        actionButton={
          hasChanges ? (
            <SaveAndCancelButtons
              isSaveDisabled={isLoading}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          ) : undefined
        }
      >
        <SettingsPageContainer>
          {stats && stats.activeInstalls > 0 && (
            <Section>
              <H2Title
                title={t`Install Stats`}
                description={t`Usage across all workspaces on this server`}
              />
              <SettingsAdminTableCard
                rounded
                items={statsItems}
                gridAutoColumns="3fr 8fr"
              />
            </Section>
          )}

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
              title={t`Marketplace Listing`}
              description={t`Control visibility on the marketplace. Unlisted apps are still accessible via direct link.`}
            />
            <Card rounded>
              <SettingsOptionCardContentToggle
                title={t`Listed on marketplace`}
                description={
                  isNpmSource
                    ? t`Managed by the marketplace catalog sync for npm packages`
                    : t`When enabled, this app appears in the marketplace browse page`
                }
                checked={registration.isListed}
                onChange={handleToggleListed}
                disabled={isNpmSource}
                divider
              />
              <SettingsOptionCardContentToggle
                title={t`Featured`}
                description={t`Featured apps are curated. Open a PR to request featured status.`}
                checked={registration.isFeatured}
                onChange={() => {}}
                disabled
              />
            </Card>
            <StyledMarketplaceActions>
              <Button
                Icon={IconExternalLink}
                title={t`View marketplace page`}
                variant="secondary"
                to={marketplacePageUrl}
              />
            </StyledMarketplaceActions>
          </Section>

          <Section>
            <H2Title
              title={t`Installation`}
              description={t`Install this app on the current workspace`}
            />
            <Button
              Icon={isInstalledOnWorkspace ? IconCheck : IconDownload}
              title={
                isInstalledOnWorkspace
                  ? t`Installed`
                  : t`Install on this workspace`
              }
              variant="secondary"
              accent="blue"
              disabled={isInstalledOnWorkspace || isInstalling}
              onClick={handleInstallOnWorkspace}
            />
          </Section>

          <Section>
            <H2Title
              title={t`OAuth Credentials`}
              description={t`Credentials and scopes for OAuth authorization flows`}
            />
            <SettingsAdminTableCard
              rounded
              items={credentialItems}
              gridAutoColumns="3fr 8fr"
            />
            <StyledRotateContainer>
              <Button
                Icon={IconRefresh}
                title={t`Rotate client secret`}
                variant="secondary"
                onClick={() => openModal(ROTATE_SECRET_MODAL_ID)}
              />
            </StyledRotateContainer>
          </Section>

          {displayedSecret && (
            <Section>
              <H2Title
                title={t`Client Secret`}
                description={t`Copy this secret as it will not be visible again`}
              />
              <ApiKeyInput apiKey={displayedSecret} />
            </Section>
          )}

          <Section>
            <H2Title
              title={t`Redirect URIs`}
              description={t`Allowed redirect URIs for OAuth flows`}
            />
            {formRedirectUris.map((uri, index) => (
              <StyledRedirectUriRow key={`${uri}-${index}`}>
                <StyledRedirectUriValue>{uri}</StyledRedirectUriValue>
                <Button
                  Icon={IconTrash}
                  variant="tertiary"
                  size="medium"
                  onClick={() => handleRemoveRedirectUri(index)}
                />
              </StyledRedirectUriRow>
            ))}
            <StyledInputContainer>
              <SettingsTextInput
                instanceId="application-registration-new-redirect-uri"
                value={newRedirectUri}
                onChange={setNewRedirectUri}
                placeholder={t`https://example.com/callback`}
                fullWidth
              />
              <Button
                title={t`Add`}
                variant="secondary"
                size="medium"
                onClick={handleAddRedirectUri}
              />
            </StyledInputContainer>
          </Section>

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
        </SettingsPageContainer>
      </SubMenuTopBarContainer>

      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalInstanceId={ROTATE_SECRET_MODAL_ID}
        title={t`Rotate client secret`}
        subtitle={
          <Trans>
            If you rotate this secret, any integration using the current secret
            will stop working. Please type {`"${confirmationValue}"`} to
            confirm.
          </Trans>
        }
        onConfirmClick={handleRotateSecret}
        confirmButtonText={t`Rotate secret`}
        loading={isLoading}
      />

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
