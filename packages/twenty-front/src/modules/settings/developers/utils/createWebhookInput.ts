import { isNonEmptyString } from '@sniptt/guards';

import { type WebhookFormValues } from '@/settings/developers/validation-schemas/webhookFormSchema';
import { cleanAndFormatOperations } from './cleanAndFormatOperations';

const toWebhookCondition = (condition: string | undefined) => {
  const trimmedCondition = condition?.trim();

  return isNonEmptyString(trimmedCondition) ? trimmedCondition : null;
};

export const createWebhookCreateInput = (formValues: WebhookFormValues) => {
  const cleanedOperations = cleanAndFormatOperations(formValues.operations);

  return {
    targetUrl: formValues.targetUrl.trim(),
    operations: cleanedOperations,
    description: formValues.description,
    condition: toWebhookCondition(formValues.condition),
    secret: formValues.secret,
    roleId: formValues.roleId,
  };
};

export const createWebhookUpdateInput = (formValues: WebhookFormValues) => {
  const cleanedOperations = cleanAndFormatOperations(formValues.operations);

  return {
    targetUrl: formValues.targetUrl.trim(),
    operations: cleanedOperations,
    description: formValues.description,
    condition: toWebhookCondition(formValues.condition),
    secret: formValues.secret,
    roleId: formValues.roleId,
  };
};
