import { MESSENGER_WEBHOOK_FIELDS } from 'src/constants/messenger-webhook-fields.constant';

export type SubscribedApp = { id: string; subscribed_fields?: string[] };

export const getWebhookSubscriptionState = ({
  subscribedApps,
  appId,
}: {
  subscribedApps: SubscribedApp[];
  appId: string;
}) => {
  const subscribedApp = subscribedApps.find(({ id }) => id === appId);
  const subscribedFields = subscribedApp?.subscribed_fields ?? [];

  return {
    isSubscribed: subscribedApp !== undefined,
    missingWebhookFields: MESSENGER_WEBHOOK_FIELDS.filter(
      (field) => !subscribedFields.includes(field),
    ),
  };
};
