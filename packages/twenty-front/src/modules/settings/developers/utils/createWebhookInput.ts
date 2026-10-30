import { isNonEmptyString } from '@sniptt/guards';
import { type WebhookFormValues } from '@/settings/developers/validation-schemas/webhookFormSchema';
import { cleanAndFormatOperations } from './cleanAndFormatOperations';

type CreateWebhookInputArgs = {
  formValues: WebhookFormValues;
  canAssignRole: boolean;
};

export const createWebhookCreateInput = ({
  formValues,
  canAssignRole,
}: CreateWebhookInputArgs) => {
  const cleanedOperations = cleanAndFormatOperations(formValues.operations);

  return {
    targetUrl: formValues.targetUrl.trim(),
    operations: cleanedOperations,
    description: formValues.description,
    secret: formValues.secret,
    ...(canAssignRole &&
      isNonEmptyString(formValues.roleId) && { roleId: formValues.roleId }),
  };
};

export const createWebhookUpdateInput = ({
  formValues,
  canAssignRole,
}: CreateWebhookInputArgs) => {
  const cleanedOperations = cleanAndFormatOperations(formValues.operations);

  return {
    targetUrl: formValues.targetUrl.trim(),
    operations: cleanedOperations,
    description: formValues.description,
    secret: formValues.secret,
    ...(canAssignRole && { roleId: formValues.roleId }),
  };
};
