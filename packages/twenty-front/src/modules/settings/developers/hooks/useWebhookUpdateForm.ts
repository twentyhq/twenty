import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import {
  webhookFormSchema,
  WebhookFormValues,
} from '@/settings/developers/validation-schemas/webhookFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  getUrlHostnameOrThrow,
  isDefined,
  isValidUrl,
} from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

export const useWebhookUpdateForm = ({
  webhookId,
  isCreationMode,
}: {
  webhookId: string;
  isCreationMode: boolean;
}) => {
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();

  const [loading, setLoading] = useState(!isCreationMode);
  const [title, setTitle] = useState(isCreationMode ? 'New Webhook' : '');

  const { updateOneRecord } = useUpdateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const { createOneRecord } = useCreateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

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

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isCreationMode
    ? isValid && !isSubmitting
    : isDirty && isValid && !isSubmitting;

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

  const handleSave = async (formValues: WebhookFormValues) => {
    try {
      const cleanedOperations = cleanAndFormatOperations(formValues.operations);

      const webhookData = {
        targetUrl: formValues.targetUrl.trim(),
        operations: cleanedOperations,
        description: formValues.description,
        secret: formValues.secret,
      };

      if (isCreationMode) {
        const { data: response } = await createOneRecord({
          id: webhookId,
          ...webhookData,
        });
        navigate(
          response ? SettingsPath.WebhookDetail : SettingsPath.Webhooks,
          response ? { webhookId: response.id } : undefined,
        );
        return;
      }

      await updateOneRecord({
        idToUpdate: webhookId,
        updateOneRecordInput: webhookData,
      });
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

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

  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const deleteWebhook = async () => {
    try {
      await deleteOneWebhook(webhookId);
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

  // Watch targetUrl to update title
  const targetUrl = formConfig.watch('targetUrl');
  useEffect(() => {
    if (isDefined(targetUrl) && isValidUrl(targetUrl.trim())) {
      setTitle(getUrlHostnameOrThrow(targetUrl) || 'New Webhook');
    } else if (isCreationMode) {
      setTitle('New Webhook');
    }
  }, [targetUrl, isCreationMode]);

  useFindOneRecord({
    skip: isCreationMode,
    objectNameSingular: CoreObjectNameSingular.Webhook,
    objectRecordId: webhookId,
    onCompleted: (data) => {
      const baseOperations = data?.operations
        ? data.operations.map((op: string) => {
            const [object, action] = op.split('.');
            return { object, action };
          })
        : data?.operation
          ? [
              {
                object: data.operation.split('.')[0],
                action: data.operation.split('.')[1],
              },
            ]
          : [];
      const operations = addEmptyOperationIfNecessary(baseOperations);

      formConfig.reset({
        targetUrl: data.targetUrl || '',
        description: data.description || '',
        operations,
        secret: data.secret || '',
      });

      if (isValidUrl(data.targetUrl)) {
        setTitle(getUrlHostnameOrThrow(data.targetUrl));
      }

      setLoading(false);
    },
  });

  return {
    formConfig,
    title,
    canSave,
    handleSave,
    updateOperation,
    removeOperation,
    deleteWebhook,
    loading,
  };
};
