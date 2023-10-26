import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ExpirationDates } from '@/settings/developers/constants/expirationDates';
import { generatedApiKeyState } from '@/settings/developers/states/generatedApiKeyState';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useInsertOneApiKeyMutation } from '~/generated/graphql';

export const SettingsDevelopersApiKeysNew = () => {
  const [insertOneApiKey] = useInsertOneApiKeyMutation();
  const navigate = useNavigate();
  const [, setGeneratedApiKey] = useRecoilState(generatedApiKeyState);
  const [formValues, setFormValues] = useState<{
    name: string;
    expirationDate: number;
  }>({
    expirationDate: ExpirationDates[0].value,
    name: '',
  });
  const onSave = async () => {
    const apiKey = await insertOneApiKey({
      variables: {
        data: {
          name: formValues.name,
          expiresAt: DateTime.now()
            .plus({ days: formValues.expirationDate })
            .toISODate(),
        },
      },
    });
    setGeneratedApiKey(apiKey.data?.createOneApiKey?.token);
    navigate(
      `/settings/developers/api-keys/${apiKey.data?.createOneApiKey?.id}`,
    );
  };
  const canSave = !!formValues.name;
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
