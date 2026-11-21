import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_WEBHOOK_FIELDS } from 'src/constants/messenger-webhook-fields.constant';
import { type SubscribedApp } from 'src/logic-functions/types/subscribed-app.type';

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
    isSubscribed: isDefined(subscribedApp),
    missingWebhookFields: MESSENGER_WEBHOOK_FIELDS.filter(
      (field) => !subscribedFields.includes(field),
    ),
  };
};
