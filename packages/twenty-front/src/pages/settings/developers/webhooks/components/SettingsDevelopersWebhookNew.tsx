import { SettingsDevelopersWebhookForm } from '@/settings/developers/components/SettingsDevelopersWebhookForm';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';

export const SettingsDevelopersWebhookNew = () => {
  return <SettingsDevelopersWebhookForm mode={WebhookFormMode.Create} />;
};
