import { useState } from 'react';
import { H2Title, isDefined, Section } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { isValidUrl } from '~/utils/url/isValidUrl';

export const SettingsDevelopersWebhooksNew = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();

  const [formValues, setFormValues] = useState<{
    targetUrl: string;
    operations: string[];
  }>({
    targetUrl: '',
    operations: ['*.*'],
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
    navigate(SettingsPath.DevelopersNewWebhookDetail, {
      webhookId: newWebhook.id,
    });
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
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Developers`,
          href: getSettingsPath(SettingsPath.Developers),
        },
        { children: t`New Webhook` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => {
            navigate(SettingsPath.Developers);
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Endpoint URL`}
            description={t`We will send POST requests to this endpoint for every new event`}
          />
          <TextInput
            placeholder={t`URL`}
            value={formValues.targetUrl}
            error={!isTargetUrlValid ? t`Please enter a valid URL` : undefined}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            fullWidth
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
