import { LogConsoleDetailPanelLayout } from '@/log-console/components/LogConsoleDetailPanelLayout';
import { logConsoleApisViewState } from '@/log-console/states/logConsoleApisViewState';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { ApiKeyNameInput } from '@/settings/developers/components/ApiKeyNameInput';
import { SettingsDevelopersRoleSelector } from '@/settings/developers/components/SettingsDevelopersRoleSelector';
import { apiKeyTokenFamilyState } from '@/settings/developers/states/apiKeyTokenFamilyState';
import { computeNewExpirationDate } from '@/settings/developers/utils/computeNewExpirationDate';
import { formatExpiration } from '@/settings/developers/utils/formatExpiration';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconKey, IconRepeat, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  AssignRoleToApiKeyDocument,
  CreateApiKeyDocument,
  GenerateApiKeyTokenDocument,
  GetApiKeyDocument,
  GetApiKeyRolesDocument,
  GetApiKeysDocument,
  RevokeApiKeyDocument,
} from '~/generated-metadata/graphql';

const StyledInfo = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const DELETE_API_KEY_MODAL_ID = 'delete-api-key-modal';
const REGENERATE_API_KEY_MODAL_ID = 'regenerate-api-key-modal';

type LogConsoleApiKeyDetailProps = {
  apiKeyId: string;
};

export const LogConsoleApiKeyDetail = ({
  apiKeyId,
}: LogConsoleApiKeyDetailProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const [isLoading, setIsLoading] = useState(false);

  const setLogConsoleApisView = useSetAtomState(logConsoleApisViewState);
  const goBackToList = () => setLogConsoleApisView({ type: 'list' });

  const jotaiStore = useStore();

  const apiKeyToken = useAtomFamilyStateValue(apiKeyTokenFamilyState, apiKeyId);

  const [generateOneApiKeyToken] = useMutation(GenerateApiKeyTokenDocument);
  const [createApiKey] = useMutation(CreateApiKeyDocument, {
    refetchQueries: [GetApiKeysDocument],
  });
  const [revokeApiKey] = useMutation(RevokeApiKeyDocument, {
    refetchQueries: [GetApiKeysDocument],
  });
  const [assignRoleToApiKey] = useMutation(AssignRoleToApiKeyDocument);

  const { data: apiKeyData, loading: apiKeyLoading } = useQuery(
    GetApiKeyDocument,
    {
      variables: {
        input: {
          id: apiKeyId,
        },
      },
    },
  );

  useEffect(() => {
    if (isDefined(apiKeyData?.apiKey)) {
      setApiKeyName(apiKeyData.apiKey.name);
      if (isDefined(apiKeyData.apiKey.role)) {
        setSelectedRoleId(apiKeyData.apiKey.role.id);
      }
    }
  }, [apiKeyData]);

  const { data: rolesData, loading: rolesLoading } = useQuery(
    GetApiKeyRolesDocument,
  );

  const roles = rolesData?.getApiKeyRoles ?? [];

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
      enqueueToast({
        status: 'success',
        children: t`Role updated successfully`,
      });
      setSelectedRoleId(roleId);
    } catch {
      enqueueToast({ status: 'error', children: t`Error updating role` });
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
        goBackToList();
      }
    } catch {
      enqueueToast({ status: 'error', children: t`Error deleting api key.` });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (
    name: string,
    newExpiresAt: string | null,
  ) => {
    const roleIdToUse = selectedRoleId;

    if (!roleIdToUse) {
      enqueueToast({
        status: 'error',
        children: t`A role must be selected for the API key`,
      });
      return;
    }

    if (!isDefined(roleIdToUse)) {
      throw new Error('Role not selected - this should never happen');
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
      if (isDefined(apiKey)) {
        if (!isNonEmptyString(apiKeyName)) {
          enqueueToast({
            status: 'error',
            children: t`API key name cannot be empty`,
          });
          return;
        }
        const newExpiresAt = computeNewExpirationDate(
          apiKey.expiresAt,
          apiKey.createdAt,
        );
        const newApiKey = await createIntegration(apiKeyName, newExpiresAt);
        await deleteIntegration(false);

        if (isNonEmptyString(newApiKey?.token)) {
          jotaiStore.set(
            apiKeyTokenFamilyState.atomFamily(newApiKey.id),
            newApiKey.token,
          );
          setLogConsoleApisView({ type: 'detail', id: newApiKey.id });
        }
      }
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Error regenerating api key.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmationValue = t`yes`;

  const apiKeyIcon = (
    <IconKey size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
  );

  if (apiKeyLoading || rolesLoading || !isDefined(apiKey)) {
    return (
      <LogConsoleDetailPanelLayout
        title={t`API Key`}
        icon={apiKeyIcon}
        onClose={goBackToList}
      >
        {apiKeyLoading || rolesLoading ? (
          <SettingsSkeletonLoader />
        ) : (
          <SettingsEmptyPlaceholder>{t`This API key no longer exists.`}</SettingsEmptyPlaceholder>
        )}
      </LogConsoleDetailPanelLayout>
    );
  }

  return (
    <>
      <LogConsoleDetailPanelLayout
        title={apiKey.name || t`Unnamed API Key`}
        icon={apiKeyIcon}
        onClose={goBackToList}
      >
        <Section.Root>
          {apiKeyToken ? (
            <>
              <Section.Header
                title={t`API Key`}
                description={t`Copy this key as it will not be visible again`}
              />
              <ApiKeyInput apiKey={apiKeyToken} />
            </>
          ) : (
            <>
              <Section.Header
                title={t`API Key`}
                description={t`Regenerate an API key`}
              />
              <StyledInputContainer>
                <Button
                  startIcon={<IconRepeat />}
                  onClick={() => openDialog(REGENERATE_API_KEY_MODAL_ID)}
                >{t`Regenerate Key`}</Button>
                <StyledInfo>
                  {formatExpiration(apiKey.expiresAt, true, false)}
                </StyledInfo>
              </StyledInputContainer>
            </>
          )}
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Name`}
            description={t`Name of your API key`}
          />
          <ApiKeyNameInput
            apiKeyName={apiKeyName}
            apiKeyId={apiKey.id}
            disabled={isLoading}
            onNameUpdate={setApiKeyName}
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Role`}
            description={t`What this API can do: Select a user role to define its permissions.`}
          />
          <SettingsDevelopersRoleSelector
            value={selectedRoleId}
            onChange={handleRoleChange}
            roles={roles}
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Expiration`}
            description={t`When the key will be disabled`}
          />
          <SettingsTextInput
            instanceId={`api-key-expiration-${apiKey.id}`}
            value={formatExpiration(apiKey.expiresAt, true, false)}
            disabled
            fullWidth
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Danger zone`}
            description={t`Delete this integration`}
          />
          <Button
            startIcon={<IconTrash />}
            onClick={() => openDialog(DELETE_API_KEY_MODAL_ID)}
            variant="outline"
            color="danger"
          >{t`Delete`}</Button>
        </Section.Root>
      </LogConsoleDetailPanelLayout>
      <ConfirmationDialog
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        dialogId={DELETE_API_KEY_MODAL_ID}
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
      <ConfirmationDialog
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        dialogId={REGENERATE_API_KEY_MODAL_ID}
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
