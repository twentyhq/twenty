import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2Title, IconCode } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { isValidUrl } from '~/utils/url/isValidUrl';

export const SettingsDevelopersWebhooksNew = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<{
    targetUrl: string;
    operation: string;
  }>({
    targetUrl: '',
    operation: '*.*',
  });
  const [isTargetUrlValid, setIsTargetUrlValid] = useState(true);

  const { createOneRecord: createOneWebhook } = useCreateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const handleValidate = async (value: string) => {
    const trimmedUrl = value.trim();

    setIsTargetUrlValid(isValidUrl(trimmedUrl));
  };

  const handleSave = async () => {
    const newWebhook = await createOneWebhook?.(formValues);

    if (!newWebhook) {
      return;
    }
    navigate(`/settings/developers/webhooks/${newWebhook.id}`);
  };

  const canSave =
    !!formValues.targetUrl && isTargetUrlValid && createOneWebhook;

  return (
    <SubMenuTopBarContainer
      Icon={IconCode}
      title={
        <Breadcrumb
          links={[
            { children: 'Developers', href: '/settings/developers' },
            { children: 'New webhook' },
          ]}
        />
      }
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => {
            navigate('/settings/developers');
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="Endpoint URL"
            description="We will send POST requests to this endpoint for every new event"
          />
          <TextInput
            placeholder="URL"
            value={formValues.targetUrl}
            error={!isTargetUrlValid ? 'Please enter a valid URL' : undefined}
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
              handleValidate(value);
            }}
            fullWidth
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
