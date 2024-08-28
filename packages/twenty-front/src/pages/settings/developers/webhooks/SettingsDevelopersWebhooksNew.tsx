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

export const SettingsDevelopersWebhooksNew = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<{
    targetUrl: string;
    operation: string;
  }>({
    targetUrl: '',
    operation: '*.*',
  });
  const [isUrlValid, setIsUrlValid] = useState(true);

  const { createOneRecord: createOneWebhook } = useCreateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const validateUrl = (url: string) => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i', // fragment locator
    );
    return !!urlPattern.test(url);
  };

  const handleSave = async () => {
    const trimmedUrl = formValues.targetUrl.trim();

    if (!trimmedUrl) {
      setIsUrlValid(false);
      throw new Error('Endpoint URL cannot be empty');
    }

    if (!validateUrl(trimmedUrl)) {
      setIsUrlValid(false);
      return;
    }

    setIsUrlValid(true);

    const newWebhook = await createOneWebhook?.(formValues);

    if (!newWebhook) {
      return;
    }
    navigate(`/settings/developers/webhooks/${newWebhook.id}`);
  };

  const canSave = !!formValues.targetUrl && isUrlValid && createOneWebhook;

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
            error={isUrlValid ? undefined : 'Please enter a valid URL'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission or other default behaviors
                handleSave(); // Manually trigger the save process, which includes validation
              }
            }}
            onChange={(value) => {
              setFormValues((prevState) => ({
                ...prevState,
                targetUrl: value,
              }));
              setIsUrlValid(validateUrl(value));
            }}
            fullWidth
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
