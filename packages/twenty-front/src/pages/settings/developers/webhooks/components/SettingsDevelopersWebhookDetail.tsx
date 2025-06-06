import { useParams } from 'react-router-dom';

import { SettingsDevelopersWebhookForm } from '@/settings/developers/components/SettingsDevelopersWebhookForm';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';

export const SettingsDevelopersWebhookDetail = () => {
  const { webhookId } = useParams();

  return (
    <SettingsDevelopersWebhookForm
      mode={WebhookFormMode.Edit}
      webhookId={webhookId}
    />
  );
};
