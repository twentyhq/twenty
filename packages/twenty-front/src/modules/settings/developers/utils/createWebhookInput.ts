import { type WebhookFormValues } from '@/settings/developers/validation-schemas/webhookFormSchema';
import { cleanAndFormatOperations } from './cleanAndFormatOperations';

export const createWebhookCreateInput = (formValues: WebhookFormValues) => {
  const cleanedOperations = cleanAndFormatOperations(formValues.operations);

  return {
    targetUrl: formValues.targetUrl.trim(),
    operations: cleanedOperations,
    description: formValues.description,
    secret: formValues.secret,
  };
};

export const createWebhookUpdateInput = (formValues: WebhookFormValues) => {
  const cleanedOperations = cleanAndFormatOperations(formValues.operations);

  return {
    targetUrl: formValues.targetUrl.trim(),
    operations: cleanedOperations,
    description: formValues.description,
    secret: formValues.secret,
  };
};
