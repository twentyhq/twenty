import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  H2Title,
  IconKey,
  IconRefresh,
  IconShield,
  IconTrash,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  FindManyApplicationRegistrationsDocument,
  FindOneApplicationRegistrationDocument,
  RotateApplicationRegistrationClientSecretDocument,
  UpdateApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';
import { applicationRegistrationClientSecretFamilyState } from '~/pages/settings/applications/states/applicationRegistrationClientSecretFamilyState';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { isValidUrl } from 'twenty-shared/utils';

const ROTATE_SECRET_MODAL_ID = 'rotate-application-registration-secret-modal';

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

const StyledRotateContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledSaveContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationOAuthTab = ({
  registration,
}: {
  registration: ApplicationRegistrationData;
}) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();

  const applicationRegistrationId = registration.id;

  const applicationRegistrationClientSecret = useAtomFamilyStateValue(
    applicationRegistrationClientSecretFamilyState,
    applicationRegistrationId,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null);
  const [formRedirectUris, setFormRedirectUris] = useState<string[]>(
    registration.oAuthRedirectUris ?? [],
  );
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const [updateRegistration] = useMutation(
    UpdateApplicationRegistrationDocument,
    {
      refetchQueries: [
        FindOneApplicationRegistrationDocument,
        FindManyApplicationRegistrationsDocument,
      ],
    },
  );

  const [rotateSecret] = useMutation(
    RotateApplicationRegistrationClientSecretDocument,
  );

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
      enqueueSuccessSnackBar({ message: t`Redirect URIs updated` });
    } catch {
      enqueueErrorSnackBar({ message: t`Error updating redirect URIs` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormRedirectUris(registration.oAuthRedirectUris ?? []);
    setHasChanges(false);
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

  const displayedSecret = rotatedSecret ?? applicationRegistrationClientSecret;
  const confirmationValue = t`yes`;

  const credentialItems = [
    {
      Icon: IconKey,
      label: t`Client ID`,
      value: registration.oAuthClientId,
    },
    {
      Icon: IconShield,
      label: t`Scopes`,
      value: (registration.oAuthScopes ?? []).join(', ') || '—',
    },
  ];

  return (
    <>
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
        {hasChanges && (
          <StyledSaveContainer>
            <Button
              title={t`Save`}
              variant="primary"
              accent="blue"
              onClick={handleSave}
              disabled={isLoading}
            />
            <Button
              title={t`Cancel`}
              variant="secondary"
              onClick={handleCancel}
            />
          </StyledSaveContainer>
        )}
      </Section>

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
    </>
  );
};
