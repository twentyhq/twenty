import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import {
  webhookFormSchema,
  WebhookFormValues,
} from '@/settings/developers/validation-schemas/webhookFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  useCreateWebhookMutation,
  useDeleteWebhookMutation,
  useGetWebhookQuery,
  useUpdateWebhookMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

type UseWebhookFormProps = {
  webhookId?: string;
  mode: WebhookFormMode;
};

export const useWebhookForm = ({ webhookId, mode }: UseWebhookFormProps) => {
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();

  const isCreationMode = mode === WebhookFormMode.Create;

  const [createWebhook] = useCreateWebhookMutation();

  const [updateWebhook] = useUpdateWebhookMutation();

  const [deleteWebhook] = useDeleteWebhookMutation();

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

  const { loading, error } = useGetWebhookQuery({
    skip: isCreationMode || !webhookId,
    variables: {
      input: { id: webhookId || '' },
    },
    onCompleted: (data) => {
      const webhook = data.webhook;
      if (!webhook) return;

      const baseOperations =
        webhook?.operations && webhook.operations.length > 0
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
    onError: (error) => {
      enqueueSnackBar(`Failed to load webhook: ${error.message}`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isCreationMode
    ? isValid && !isSubmitting
    : isDirty && isValid && !isSubmitting;

  const handleCreate = async (formValues: WebhookFormValues) => {
    try {
      const cleanedOperations = cleanAndFormatOperations(formValues.operations);

      const webhookData = {
        id: v4(),
        targetUrl: formValues.targetUrl.trim(),
        operations: cleanedOperations,
        description: formValues.description,
        secret: formValues.secret,
      };

      const { data: createdWebhookData } = await createWebhook({
        variables: {
          input: webhookData,
        },
      });

      const createdWebhook = createdWebhookData?.createWebhook;

      enqueueSnackBar(
        `Webhook ${createdWebhook?.targetUrl} created successfully`,
        {
          variant: SnackBarVariant.Success,
        },
      );

      navigate(
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
    if (!webhookId) {
      enqueueSnackBar('Webhook ID is required for updates', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    try {
      const cleanedOperations = cleanAndFormatOperations(formValues.operations);

      const webhookData = {
        id: webhookId,
        targetUrl: formValues.targetUrl.trim(),
        operations: cleanedOperations,
        description: formValues.description,
        secret: formValues.secret,
      };

      const { data: updatedWebhookData } = await updateWebhook({
        variables: {
          input: webhookData,
        },
      });

      const updatedWebhook = updatedWebhookData?.updateWebhook;

      formConfig.reset(formValues);

      enqueueSnackBar(
        `Webhook ${updatedWebhook?.targetUrl} updated successfully`,
        {
          variant: SnackBarVariant.Success,
        },
      );
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

    formConfig.setValue(
      'operations',
      addEmptyOperationIfNecessary(newOperations),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const removeOperation = (index: number) => {
    const currentOperations = formConfig.getValues('operations');
    const newOperations = currentOperations.filter((_, i) => i !== index);

    formConfig.setValue(
      'operations',
      addEmptyOperationIfNecessary(newOperations),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleDelete = async () => {
    if (!webhookId) {
      enqueueSnackBar('Webhook ID is required for deletion', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    try {
      await deleteWebhook({
        variables: {
          input: {
            id: webhookId,
          },
        },
      });
      enqueueSnackBar('Webhook deleted successfully', {
        variant: SnackBarVariant.Success,
      });

      navigate(SettingsPath.Webhooks);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    formConfig,
    loading,
    canSave,
    handleSave,
    updateOperation,
    removeOperation,
    handleDelete,
    isCreationMode,
    error,
  };
};
