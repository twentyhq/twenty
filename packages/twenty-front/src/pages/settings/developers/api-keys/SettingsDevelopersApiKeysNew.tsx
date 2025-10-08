import { addDays } from 'date-fns';
import { useState } from 'react';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsDevelopersRoleSelector } from '@/settings/developers/components/SettingsDevelopersRoleSelector';
import { EXPIRATION_DATES } from '@/settings/developers/constants/ExpirationDates';
import { apiKeyTokenFamilyState } from '@/settings/developers/states/apiKeyTokenFamilyState';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  useCreateApiKeyMutation,
  useGenerateApiKeyTokenMutation,
  useGetRolesQuery,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsDevelopersApiKeysNew = () => {
  const { t } = useLingui();
  const [generateOneApiKeyToken] = useGenerateApiKeyTokenMutation();
  const navigateSettings = useNavigateSettings();
  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery({
    onCompleted: (data) => {
      if (isDefined(data?.getRoles)) {
        const apiKeyAssignableRoles = data.getRoles.filter(
          (role) => role.canBeAssignedToApiKeys,
        );
        if (!formValues.roleId && apiKeyAssignableRoles.length > 0) {
          setFormValues((prev) => ({
            ...prev,
            roleId: apiKeyAssignableRoles[0].id,
          }));
        }
      }
    },
  });
  const roles = rolesData?.getRoles ?? [];

  const [formValues, setFormValues] = useState<{
    name: string;
    expirationDate: number | null;
    roleId: string;
  }>({
    expirationDate: EXPIRATION_DATES[5].value,
    name: '',
    roleId: '',
  });

  const [createApiKey] = useCreateApiKeyMutation();

  const setApiKeyTokenCallback = useRecoilCallback(
    ({ set }) =>
      (apiKeyId: string, token: string) => {
        set(apiKeyTokenFamilyState(apiKeyId), token);
      },
    [],
  );

  const handleSave = async () => {
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
          name: formValues.name,
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
      navigateSettings(SettingsPath.ApiKeyDetail, {
        apiKeyId: newApiKey.id,
      });
    }
  };

  const canSave = !!formValues.name && !!formValues.roleId && createApiKey;

  if (rolesLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SubMenuTopBarContainer
      title={t`New key`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`APIs & Webhooks`,
          href: getSettingsPath(SettingsPath.ApiWebhooks),
        },
        { children: t`New Key` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => {
            navigateSettings(SettingsPath.ApiWebhooks);
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Name`} description={t`Name of your API key`} />
          <SettingsTextInput
            instanceId="api-key-new-name"
            placeholder={t`E.g. backoffice integration`}
            value={formValues.name}
            onKeyDown={(e) => {
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
        </Section>
        <Section>
          <H2Title
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
        </Section>
        <Section>
          <H2Title
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
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
