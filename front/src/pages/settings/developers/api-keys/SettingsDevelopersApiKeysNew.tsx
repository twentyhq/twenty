import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';

import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ExpirationDates } from '@/settings/developers/constants/expirationDates';
import { useGeneratedApiKeys } from '@/settings/developers/hooks/useGeneratedApiKeys';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { ApiKey, useGenerateOneApiKeyTokenMutation } from '~/generated/graphql';

export const SettingsDevelopersApiKeysNew = () => {
  const [generateOneApiKeyToken] = useGenerateOneApiKeyTokenMutation();
  const navigate = useNavigate();
  const setGeneratedApi = useGeneratedApiKeys();
  const [formValues, setFormValues] = useState<{
    name: string;
    expirationDate: number | null;
  }>({
    expirationDate: ExpirationDates[0].value,
    name: '',
  });

  const { createOneObject: createOneApiKey } = useCreateOneObjectRecord<ApiKey>(
    {
      objectNameSingular: 'apiKeyV2',
    },
  );
  const onSave = async () => {
    const expiresAt = formValues.expirationDate
      ? DateTime.now().plus({ days: formValues.expirationDate }).toString()
      : null;
    const newApiKey = await createOneApiKey?.({
      name: formValues.name,
      expiresAt,
    });

    if (!newApiKey) {
      return;
    }

    const tokenData = await generateOneApiKeyToken({
      variables: {
        data: {
          id: newApiKey.id,
          expiresAt: newApiKey.expiresAt,
          name: newApiKey.name, // TODO update typing to remove useless name param here
        },
      },
    });
    if (tokenData.data?.generateApiKeyV2Token) {
      setGeneratedApi(newApiKey.id, tokenData.data.generateApiKeyV2Token.token);
      navigate(`/settings/developers/api-keys/${newApiKey.id}`);
    }
  };
  const canSave = !!formValues.name && createOneApiKey;
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'APIs', href: '/settings/developers/api-keys' },
              { children: 'New' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => {
              navigate('/settings/developers/api-keys');
            }}
            onSave={onSave}
          />
        </SettingsHeaderContainer>
        <Section>
          <H2Title title="Name" description="Name of your API key" />
          <TextInput
            placeholder="E.g. backoffice integration"
            value={formValues.name}
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
            title="Expiration Date"
            description="When the API key will expire."
          />
          <Select
            dropdownScopeId="object-field-type-select"
            options={ExpirationDates}
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
