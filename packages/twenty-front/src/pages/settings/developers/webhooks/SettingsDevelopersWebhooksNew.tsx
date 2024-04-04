import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSettings } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { isURL } from '~/utils/is-url';

export const SettingsDevelopersWebhooksNew = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<{
    targetUrl: string;
    operation: string;
  }>({
    targetUrl: '',
    operation: '*.*',
  });
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { createOneRecord: createOneWebhook } = useCreateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });
  const handleSave = async () => {
    setErrorMessage(undefined);

    if (!isURL(formValues.targetUrl)) {
      setErrorMessage('Invalid webhook URL');
      return;
    }

    const newWebhook = await createOneWebhook?.(formValues);

    if (!newWebhook) {
      return;
    }
    navigate(`/settings/developers/webhooks/${newWebhook.id}`);
  };
  const canSave = !!formValues.targetUrl && createOneWebhook;
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Developers', href: '/settings/developers' },
              { children: 'New webhook' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => {
              navigate('/settings/developers');
            }}
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        <Section>
          <H2Title
            title="Endpoint URL"
            description="We will send POST requests to this endpoint for every new event"
          />
          <TextInput
            placeholder="URL"
            value={formValues.targetUrl}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
            onChange={(value) => {
              setFormValues((prevState) => ({
                ...prevState,
                targetUrl: value,
              }));
            }}
            error={errorMessage}
            fullWidth
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
