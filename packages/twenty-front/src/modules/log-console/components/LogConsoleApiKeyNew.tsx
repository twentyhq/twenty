import { addDays } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

import { LogConsolePageContainer } from '@/log-console/components/LogConsolePageContainer';
import { LogConsoleSubPageHeader } from '@/log-console/components/LogConsoleSubPageHeader';
import { logConsoleApiKeysViewState } from '@/log-console/states/logConsoleApiKeysViewState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsDevelopersRoleSelector } from '@/settings/developers/components/SettingsDevelopersRoleSelector';
import { EXPIRATION_DATES } from '@/settings/developers/constants/ExpirationDates';
import { apiKeyTokenFamilyState } from '@/settings/developers/states/apiKeyTokenFamilyState';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import {
  CreateApiKeyDocument,
  GenerateApiKeyTokenDocument,
  GetApiKeyRolesDocument,
  GetApiKeysDocument,
} from '~/generated-metadata/graphql';
import { Section } from 'twenty-ui/components/layout';

export const LogConsoleApiKeyNew = () => {
  const { t } = useLingui();
  const [generateOneApiKeyToken] = useMutation(GenerateApiKeyTokenDocument);
  const setLogConsoleApiKeysView = useSetAtomState(logConsoleApiKeysViewState);
  const { data: rolesData, loading: rolesLoading } = useQuery(
    GetApiKeyRolesDocument,
  );
  const roles = rolesData?.getApiKeyRoles ?? [];

  const [formValues, setFormValues] = useState<{
    name: string;
    expirationDate: number | null;
    roleId: string;
  }>({
    expirationDate: EXPIRATION_DATES[5].value,
    name: '',
    roleId: '',
  });

  useEffect(() => {
    if (isDefined(rolesData?.getApiKeyRoles)) {
      const apiKeyAssignableRoles = rolesData.getApiKeyRoles.filter(
        (role) => role.canBeAssignedToApiKeys,
      );
      if (apiKeyAssignableRoles.length > 0) {
        setFormValues((prev) => {
          if (!prev.roleId) {
            return { ...prev, roleId: apiKeyAssignableRoles[0].id };
          }
          return prev;
        });
      }
    }
  }, [rolesData]);

  const [createApiKey] = useMutation(CreateApiKeyDocument, {
    refetchQueries: [GetApiKeysDocument],
    awaitRefetchQueries: true,
  });

  const jotaiStore = useStore();

  const setApiKeyTokenCallback = useCallback(
    (apiKeyId: string, token: string) => {
      jotaiStore.set(apiKeyTokenFamilyState.atomFamily(apiKeyId), token);
    },
    [jotaiStore],
  );

  const handleSave = async () => {
    if (!formValues.name) return;

    const expiresAt = addDays(
      new Date(),
      formValues.expirationDate ?? 30,
    ).toISOString();

    const roleIdToUse = formValues.roleId;

    if (!roleIdToUse) {
      return;
    }

    const { data: newApiKeyData } = await createApiKey({
      variables: {
        input: {
          name: formValues.name.trim(),
          expiresAt,
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
        expiresAt: expiresAt,
      },
    });

    if (isDefined(tokenData.data?.generateApiKeyToken)) {
      setApiKeyTokenCallback(
        newApiKey.id,
        tokenData.data.generateApiKeyToken.token,
      );
      setLogConsoleApiKeysView({ type: 'detail', id: newApiKey.id });
    }
  };

  const canSave = !!formValues.name && !!formValues.roleId;

  if (rolesLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <>
      <LogConsoleSubPageHeader
        title={t`New key`}
        onBack={() => setLogConsoleApiKeysView({ type: 'list' })}
        actions={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => setLogConsoleApiKeysView({ type: 'list' })}
            onSave={handleSave}
          />
        }
      />
      <LogConsolePageContainer scrollWrapperInstanceId="log-console-api-key-new">
        <Section.Root>
          <Section.Header
            title={t`Name`}
            description={t`Name of your API key`}
          />
          <SettingsTextInput
            instanceId="api-key-new-name"
            placeholder={t`E.g. backoffice integration`}
            value={formValues.name}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) {
                return;
              }
              if (e.key === Key.Enter) {
                handleSave();
              }
            }}
            onChange={(value) => {
              setFormValues((prevState) => ({
                ...prevState,
                name: value,
              }));
            }}
            fullWidth
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Role`}
            description={t`What this API can do: Select a user role to define its permissions.`}
          />
          <SettingsDevelopersRoleSelector
            value={formValues.roleId}
            onChange={(roleId) => {
              setFormValues((prevState) => ({
                ...prevState,
                roleId,
              }));
            }}
            roles={roles}
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Expiration Date`}
            description={t`When the API key will expire.`}
          />
          <Select
            dropdownId="object-field-type-select"
            options={EXPIRATION_DATES}
            value={formValues.expirationDate}
            onChange={(value) => {
              setFormValues((prevState) => ({
                ...prevState,
                expirationDate: value,
              }));
            }}
          />
        </Section.Root>
      </LogConsolePageContainer>
    </>
  );
};
