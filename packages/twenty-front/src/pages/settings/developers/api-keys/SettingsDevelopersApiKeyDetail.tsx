import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { ApiKeyNameInput } from '@/settings/developers/components/ApiKeyNameInput';
import { SettingsDevelopersRoleSelector } from '@/settings/developers/components/SettingsDevelopersRoleSelector';
import { apiKeyTokenFamilyState } from '@/settings/developers/states/apiKeyTokenFamilyState';
import { computeNewExpirationDate } from '@/settings/developers/utils/computeNewExpirationDate';
import { formatExpiration } from '@/settings/developers/utils/formatExpiration';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconRepeat, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  FeatureFlagKey,
  useAssignRoleToApiKeyMutation,
  useCreateApiKeyMutation,
  useGenerateApiKeyTokenMutation,
  useGetApiKeyQuery,
  useGetRolesQuery,
  useRevokeApiKeyMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledInfo = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const DELETE_API_KEY_MODAL_ID = 'delete-api-key-modal';
const REGENERATE_API_KEY_MODAL_ID = 'regenerate-api-key-modal';

export const SettingsDevelopersApiKeyDetail = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigateSettings();
  const { apiKeyId = '' } = useParams();

  const apiKeyToken = useRecoilValue(apiKeyTokenFamilyState(apiKeyId));

  const setApiKeyTokenCallback = useRecoilCallback(
    ({ set }) =>
      (apiKeyId: string, token: string) => {
        set(apiKeyTokenFamilyState(apiKeyId), token);
      },
    [],
  );

  const isApiKeyRolesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
  );

  const [generateOneApiKeyToken] = useGenerateApiKeyTokenMutation();
  const [createApiKey] = useCreateApiKeyMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();
  const [assignRoleToApiKey] = useAssignRoleToApiKeyMutation();

  const { data: apiKeyData, loading: apiKeyLoading } = useGetApiKeyQuery({
    variables: {
      input: {
        id: apiKeyId,
      },
    },
    onCompleted: (data) => {
      if (isDefined(data?.apiKey)) {
        setApiKeyName(data.apiKey.name);
        if (isDefined(data.apiKey.role)) {
          setSelectedRoleId(data.apiKey.role.id);
        }
      }
    },
  });

  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery();

  const roles = rolesData?.getRoles ?? [];

  const apiKey = apiKeyData?.apiKey;
  const [apiKeyName, setApiKeyName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
    undefined,
  );

  const handleRoleChange = async (roleId: string) => {
    if (!apiKey?.id || !isNonEmptyString(roleId)) return;

    setIsLoading(true);
    try {
      await assignRoleToApiKey({
        variables: {
          apiKeyId: apiKey.id,
          roleId,
        },
      });
      enqueueSuccessSnackBar({
        message: t`Role updated successfully`,
      });
      setSelectedRoleId(roleId);
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Error updating role`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIntegration = async (redirect = true) => {
    setIsLoading(true);

    try {
      await revokeApiKey({
        variables: {
          input: {
            id: apiKeyId,
          },
        },
      });
      if (redirect) {
        navigate(SettingsPath.APIs);
      }
    } catch (err) {
      enqueueErrorSnackBar({ message: t`Error deleting api key.` });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (
    name: string,
    newExpiresAt: string | null,
  ) => {
    const adminRole = roles.find((role) => role.label === 'Admin');
    const roleIdToUse = isApiKeyRolesEnabled ? selectedRoleId : adminRole?.id;

    if (!roleIdToUse && isApiKeyRolesEnabled) {
      enqueueErrorSnackBar({
        message: t`A role must be selected for the API key`,
      });
      return;
    }

    if (!isDefined(roleIdToUse)) {
      throw new Error('Admin role not found - this should never happen');
    }

    const { data: newApiKeyData } = await createApiKey({
      variables: {
        input: {
          name: name,
          expiresAt: newExpiresAt ?? '',
          roleId: roleIdToUse,
        },
      },
    });

    const newApiKey = newApiKeyData?.createApiKey;

    if (!newApiKey) {
      return;
    }

    const tokenData = await generateOneApiKeyToken({
      variables: {
        apiKeyId: newApiKey.id,
        expiresAt: newApiKey?.expiresAt,
      },
    });
    return {
      id: newApiKey.id,
      token: tokenData.data?.generateApiKeyToken.token,
    };
  };

  const regenerateApiKey = async () => {
    setIsLoading(true);
    try {
      if (isNonEmptyString(apiKey?.name)) {
        const newExpiresAt = computeNewExpirationDate(
          apiKey?.expiresAt,
          apiKey?.createdAt,
        );
        const newApiKey = await createIntegration(apiKey?.name, newExpiresAt);
        await deleteIntegration(false);

        if (isNonEmptyString(newApiKey?.token)) {
          setApiKeyTokenCallback(newApiKey.id, newApiKey.token);
          navigate(SettingsPath.ApiKeyDetail, {
            apiKeyId: newApiKey.id,
          });
        }
      }
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error regenerating api key.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmationValue = t`yes`;

  if (apiKeyLoading || rolesLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <>
      {apiKey?.name && (
        <SubMenuTopBarContainer
          title={apiKey?.name}
          links={[
            {
              children: t`Workspace`,
              href: getSettingsPath(SettingsPath.Workspace),
            },
            {
              children: t`APIs`,
              href: getSettingsPath(SettingsPath.APIs),
            },
            { children: apiKey?.name },
          ]}
        >
          <SettingsPageContainer>
            <Section>
              {apiKeyToken ? (
                <>
                  <H2Title
                    title={t`API Key`}
                    description={t`Copy this key as it will not be visible again`}
                  />
                  <ApiKeyInput apiKey={apiKeyToken} />
                </>
              ) : (
                <>
                  <H2Title
                    title={t`API Key`}
                    description={t`Regenerate an API key`}
                  />
                  <StyledInputContainer>
                    <Button
                      title={t`Regenerate Key`}
                      Icon={IconRepeat}
                      onClick={() => openModal(REGENERATE_API_KEY_MODAL_ID)}
                    />
                    <StyledInfo>
                      {formatExpiration(apiKey?.expiresAt || '', true, false)}
                    </StyledInfo>
                  </StyledInputContainer>
                </>
              )}
            </Section>
            <Section>
              <H2Title title={t`Name`} description={t`Name of your API key`} />
              <ApiKeyNameInput
                apiKeyName={apiKeyName}
                apiKeyId={apiKey?.id}
                disabled={isLoading}
                onNameUpdate={setApiKeyName}
              />
            </Section>
            {isApiKeyRolesEnabled && (
              <Section>
                <H2Title
                  title={t`Role`}
                  description={t`What this API can do: Select a user role to define its permissions.`}
                />
                <SettingsDevelopersRoleSelector
                  value={selectedRoleId}
                  onChange={handleRoleChange}
                  roles={roles}
                />
              </Section>
            )}
            <Section>
              <H2Title
                title={t`Expiration`}
                description={t`When the key will be disabled`}
              />
              <TextInput
                instanceId={`api-key-expiration-${apiKey?.id}`}
                placeholder={t`E.g. backoffice integration`}
                value={formatExpiration(apiKey?.expiresAt || '', true, false)}
                disabled
                fullWidth
              />
            </Section>
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this integration`}
              />
              <Button
                accent="danger"
                variant="secondary"
                title={t`Delete`}
                Icon={IconTrash}
                onClick={() => openModal(DELETE_API_KEY_MODAL_ID)}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalId={DELETE_API_KEY_MODAL_ID}
        title={t`Delete API key`}
        subtitle={
          <Trans>
            Please type {`"${confirmationValue}"`} to confirm you want to delete
            this API Key. Be aware that any script using this key will stop
            working.
          </Trans>
        }
        onConfirmClick={deleteIntegration}
        confirmButtonText={t`Delete`}
        loading={isLoading}
      />
      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalId={REGENERATE_API_KEY_MODAL_ID}
        title={t`Regenerate an API key`}
        subtitle={
          <Trans>
            If you’ve lost this key, you can regenerate it, but be aware that
            any script using this key will need to be updated. Please type
            {`"${confirmationValue}"`} to confirm.
          </Trans>
        }
        onConfirmClick={regenerateApiKey}
        confirmButtonText={t`Regenerate key`}
        loading={isLoading}
      />
    </>
  );
};
