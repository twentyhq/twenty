import { addDays } from 'date-fns';
import { useState } from 'react';

import { LogConsoleDetailPanelLayout } from '@/log-console/components/LogConsoleDetailPanelLayout';
import { logConsoleApisViewState } from '@/log-console/states/logConsoleApisViewState';
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
import { IconKey } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

export const LogConsoleApiKeyNew = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const [generateOneApiKeyToken] = useMutation(GenerateApiKeyTokenDocument);
  const setLogConsoleApisView = useSetAtomState(logConsoleApisViewState);
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

  const roleId =
    formValues.roleId ||
    roles.find((role) => role.canBeAssignedToApiKeys)?.id ||
    '';

  const [createApiKey] = useMutation(CreateApiKeyDocument, {
    refetchQueries: [GetApiKeysDocument],
    awaitRefetchQueries: true,
  });

  const jotaiStore = useStore();

  const handleSave = async () => {
    if (!formValues.name) return;

    const expiresAt = addDays(
      new Date(),
      formValues.expirationDate ?? 30,
    ).toISOString();

    if (!roleId) {
      return;
    }

    const { data: newApiKeyData } = await createApiKey({
      variables: {
        input: {
          name: formValues.name.trim(),
          expiresAt,
          roleId,
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
      jotaiStore.set(
        apiKeyTokenFamilyState.atomFamily(newApiKey.id),
        tokenData.data.generateApiKeyToken.token,
      );
      setLogConsoleApisView({ type: 'detail', id: newApiKey.id });
    }
  };

  const canSave = !!formValues.name && !!roleId;

  const goBackToList = () => setLogConsoleApisView({ type: 'list' });

  return (
    <LogConsoleDetailPanelLayout
      title={t`New API key`}
      icon={<IconKey size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />}
      onClose={goBackToList}
      actions={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={goBackToList}
          onSave={handleSave}
        />
      }
    >
      {rolesLoading ? (
        <SettingsSkeletonLoader />
      ) : (
        <>
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
              value={roleId}
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
              fullWidth
              onChange={(value) => {
                setFormValues((prevState) => ({
                  ...prevState,
                  expirationDate: value,
                }));
              }}
            />
          </Section.Root>
        </>
      )}
    </LogConsoleDetailPanelLayout>
  );
};
