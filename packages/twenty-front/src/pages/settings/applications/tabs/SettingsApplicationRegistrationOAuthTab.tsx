import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useToast } from 'twenty-ui/feedback';
import { IconKey, IconRefresh, IconShield } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import {
  RotateApplicationRegistrationClientSecretDocument,
  UpdateApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationRedirectURIsInput } from '~/pages/settings/applications/components/SettingsApplicationRegistrationRedirectURIsInput';
import { SettingsApplicationRegistrationRedirectURIsTable } from '~/pages/settings/applications/components/SettingsApplicationRegistrationRedirectURIsTable';
import { applicationRegistrationClientSecretFamilyState } from '~/pages/settings/applications/states/applicationRegistrationClientSecretFamilyState';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';

const ROTATE_SECRET_MODAL_ID = 'rotate-application-registration-secret-modal';

const StyledRotateContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationOAuthTab = ({
  registration,
}: {
  registration: ApplicationRegistrationData;
}) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
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

  const [updateRegistration] = useMutation(
    UpdateApplicationRegistrationDocument,
  );

  const [rotateSecret] = useMutation(
    RotateApplicationRegistrationClientSecretDocument,
  );

  const handleSave = async (newFormRedirectUris: string[]) => {
    setIsLoading(true);

    try {
      await updateRegistration({
        variables: {
          input: {
            id: applicationRegistrationId,
            update: {
              oAuthRedirectUris: newFormRedirectUris,
            },
          },
        },
      });
      enqueueToast({ variant: 'success', children: t`Redirect URIs updated` });
      setFormRedirectUris(newFormRedirectUris);
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Error updating redirect URIs`,
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
        enqueueToast({
          variant: 'success',
          children: t`Client secret rotated. Copy it now — it won't be shown again.`,
        });
      }
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Error rotating client secret`,
      });
    } finally {
      setIsLoading(false);
    }
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
          title={t`OAuth`}
          description={t`Credentials and scopes for OAuth authorization flows`}
        />
        <SettingsTableCard
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
        <SettingsApplicationRegistrationRedirectURIsInput
          redirectUris={formRedirectUris}
          updateRedirectUris={handleSave}
        />
        <SettingsApplicationRegistrationRedirectURIsTable
          redirectUris={formRedirectUris}
          updateRedirectUris={handleSave}
        />
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
