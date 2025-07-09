import { DateTime } from 'luxon';
import { useState } from 'react';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { EXPIRATION_DATES } from '@/settings/developers/constants/ExpirationDates';
import { apiKeyTokenFamilyState } from '@/settings/developers/states/apiKeyTokenFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  useCreateApiKeyMutation,
  useGenerateApiKeyTokenMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsDevelopersApiKeysNew = () => {
  const { t } = useLingui();
  const [generateOneApiKeyToken] = useGenerateApiKeyTokenMutation();
  const navigateSettings = useNavigateSettings();
  const [formValues, setFormValues] = useState<{
    name: string;
    expirationDate: number | null;
  }>({
    expirationDate: EXPIRATION_DATES[5].value,
    name: '',
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
    const expiresAt = DateTime.now()
      .plus({ days: formValues.expirationDate ?? 30 })
      .toString();

    const { data: newApiKeyData } = await createApiKey({
      variables: {
        input: {
          name: formValues.name,
          expiresAt,
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
  const canSave = !!formValues.name && createApiKey;
  return (
    <SubMenuTopBarContainer
      title={t`New key`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`APIs`,
          href: getSettingsPath(SettingsPath.APIs),
        },
        { children: t`New Key` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => {
            navigateSettings(SettingsPath.APIs);
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Name`} description={t`Name of your API key`} />
          <TextInput
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
