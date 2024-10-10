import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2Title, isDefined } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
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
    !!formValues.targetUrl && isTargetUrlValid && isDefined(createOneWebhook);

  // TODO: refactor use useScopedHotkeys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSave) {
      handleSave();
    }
  };

  const handleChange = (value: string) => {
    setFormValues((prevState) => ({
      ...prevState,
      targetUrl: value,
    }));
    handleValidate(value);
  };

  return (
    <SubMenuTopBarContainer
      title="New Webhook"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Developers',
          href: getSettingsPagePath(SettingsPath.Developers),
        },
        { children: 'New Webhook' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => {
            navigate(getSettingsPagePath(SettingsPath.Developers));
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
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            fullWidth
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
