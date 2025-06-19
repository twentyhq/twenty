import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import {
  webhookFormSchema,
  WebhookFormValues,
} from '@/settings/developers/validation-schemas/webhookFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';
import {
  useCreateWebhookMutation,
  useDeleteWebhookMutation,
  useGetWebhookQuery,
  useUpdateWebhookMutation,
} from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

export const useWebhookForm = (
  webhook?: Webhook,
  mode: WebhookFormMode = WebhookFormMode.Create,
) => {
  const { enqueueSnackBar } = useSnackBar();
  const navigateSettings = useNavigateSettings();

  const [createWebhook] = useCreateWebhookMutation();
  const [updateWebhook] = useUpdateWebhookMutation();
  const [deleteWebhook] = useDeleteWebhookMutation();

  const { loading, error } = useGetWebhookQuery({
    variables: { input: { id: webhook?.id || '' } },
    skip: !webhook?.id || mode === WebhookFormMode.Create,
    onCompleted: (data) => {
      if (!data?.coreWebhook) return;

      const webhook = data.coreWebhook;
      const baseOperations = webhook?.operations
        ? webhook.operations.map((op: string) => {
            const [object, action] = op.split('.');
            return { object, action };
          })
        : [];
      const operations = addEmptyOperationIfNecessary(baseOperations);

      formConfig.reset({
        targetUrl: webhook.targetUrl || '',
        description: webhook.description || '',
        operations,
        secret: webhook.secret || '',
      });
    },
  });

  const isCreationMode = mode === WebhookFormMode.Create;

  const formConfig = useForm<WebhookFormValues>({
    mode: isCreationMode ? 'onSubmit' : 'onTouched',
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      targetUrl: '',
      description: '',
      operations: [
        {
          object: '*',
          action: '*',
        },
      ],
      secret: '',
    },
  });

  const addEmptyOperationIfNecessary = (
    newOperations: WebhookOperationType[],
  ): WebhookOperationType[] => {
    if (
      !newOperations.some((op) => op.object === '*' && op.action === '*') &&
      !newOperations.some((op) => op.object === null)
    ) {
      return [...newOperations, WEBHOOK_EMPTY_OPERATION];
    }
    return newOperations;
  };

  const cleanAndFormatOperations = (operations: WebhookOperationType[]) => {
    return Array.from(
      new Set(
        operations
          .filter((op) => isDefined(op.object) && isDefined(op.action))
          .map((op) => `${op.object}.${op.action}`),
      ),
    );
  };

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isCreationMode
    ? isValid && !isSubmitting
    : isDirty && isValid && !isSubmitting;

  const handleCreate = async (formValues: WebhookFormValues) => {
    try {
      const cleanedOperations = cleanAndFormatOperations(formValues.operations);

      const webhookData = {
        targetUrl: formValues.targetUrl.trim(),
        operations: cleanedOperations,
        description: formValues.description,
        secret: formValues.secret,
      };

      const { data } = await createWebhook({
        variables: { input: webhookData },
      });

      const createdWebhook = data?.createCoreWebhook;

      enqueueSnackBar(
        `Webhook ${createdWebhook?.targetUrl} created successfully`,
        {
          variant: SnackBarVariant.Success,
        },
      );

      navigateSettings(
        createdWebhook ? SettingsPath.WebhookDetail : SettingsPath.Webhooks,
        createdWebhook ? { webhookId: createdWebhook.id } : undefined,
      );
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleUpdate = async (formValues: WebhookFormValues) => {
    if (!webhook?.id) {
      enqueueSnackBar('Webhook ID is required for updates', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    try {
      const cleanedOperations = cleanAndFormatOperations(formValues.operations);

      const webhookData = {
        id: webhook.id,
        targetUrl: formValues.targetUrl.trim(),
        operations: cleanedOperations,
        description: formValues.description,
        secret: formValues.secret,
      };

      await updateWebhook({
        variables: { input: webhookData },
      });

      formConfig.reset(formValues);

      enqueueSnackBar(`Webhook ${webhookData.targetUrl} updated successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleSave = isCreationMode ? handleCreate : handleUpdate;

  const updateOperation = (
    index: number,
    field: 'object' | 'action',
    value: string | null,
  ) => {
    const currentOperations = formConfig.getValues('operations');
    const newOperations = [...currentOperations];

    newOperations[index] = {
      ...newOperations[index],
      [field]: value,
    };

    const updatedOperations = addEmptyOperationIfNecessary(newOperations);
    formConfig.setValue('operations', updatedOperations);
  };

  const removeOperation = (index: number) => {
    const currentOperations = formConfig.getValues('operations');
    const newOperations = currentOperations.filter((_, i) => i !== index);
    const updatedOperations = addEmptyOperationIfNecessary(newOperations);
    formConfig.setValue('operations', updatedOperations);
  };

  const handleDelete = async () => {
    if (!webhook?.id) return;

    try {
      await deleteWebhook({
        variables: { input: { id: webhook.id } },
      });

      enqueueSnackBar('Webhook deleted successfully', {
        variant: SnackBarVariant.Success,
      });

      navigateSettings(SettingsPath.Webhooks);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    formConfig,
    loading,
    error,
    canSave,
    handleSave,
    updateOperation,
    removeOperation,
    deleteWebhook: handleDelete,
    isCreationMode,
  };
};
