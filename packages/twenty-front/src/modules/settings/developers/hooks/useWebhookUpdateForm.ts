import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { SettingsPath } from '@/types/SettingsPath';
import { useState } from 'react';
import { getUrlHostnameOrThrow, isDefined, isValidUrl } from 'twenty-shared';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

type WebhookFormData = {
  targetUrl: string;
  description?: string;
  operations: WebhookOperationType[];
  secret?: string;
};

export const useWebhookUpdateForm = ({
  webhookId,
  isCreationMode,
}: {
  webhookId: string;
  isCreationMode: boolean;
}) => {
  const navigate = useNavigateSettings();

  const [isCreated, setIsCreated] = useState(!isCreationMode);
  const [loading, setLoading] = useState(!isCreationMode);
  const [title, setTitle] = useState(isCreationMode ? 'New Webhook' : '');

  const [formData, setFormData] = useState<WebhookFormData>({
    targetUrl: '',
    description: '',
    operations: [
      {
        object: '*',
        action: '*',
      },
    ],
    secret: '',
  });

  const [isTargetUrlValid, setIsTargetUrlValid] = useState(true);

  const { updateOneRecord } = useUpdateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const { createOneRecord } = useCreateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const addEmptyOperationIfNecessary = (
    newOperations: WebhookOperationType[],
  ) => {
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

  const handleSave = useDebouncedCallback(async () => {
    const cleanedOperations = cleanAndFormatOperations(formData.operations);

    const webhookData = {
      ...(isTargetUrlValid && { targetUrl: formData.targetUrl.trim() }),
      operations: cleanedOperations,
      description: formData.description,
      secret: formData.secret,
    };

    if (!isCreated) {
      await createOneRecord({ id: webhookId, ...webhookData });
      setIsCreated(true);
      return;
    }

    await updateOneRecord({
      idToUpdate: webhookId,
      updateOneRecordInput: {
        ...(isTargetUrlValid && { targetUrl: formData.targetUrl.trim() }),
        operations: cleanedOperations,
        description: formData.description,
        secret: formData.secret,
      },
    });
  }, 300);

  const isFormValidAndSetErrors = () => {
    const { targetUrl } = formData;

    if (isDefined(targetUrl)) {
      const trimmedUrl = targetUrl.trim();
      const isValid = isValidUrl(trimmedUrl);

      if (!isValid) {
        setIsTargetUrlValid(false);
        return false;
      }

      setIsTargetUrlValid(true);
    }

    return true;
  };

  const updateWebhook = async (data: Partial<WebhookFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));

    if (!isFormValidAndSetErrors()) {
      return;
    }

    if (isDefined(data?.targetUrl)) {
      setTitle(getUrlHostnameOrThrow(data.targetUrl) || 'New Webhook');
    }

    await handleSave();
  };

  const updateOperation = async (
    index: number,
    field: 'object' | 'action',
    value: string | null,
  ) => {
    const newOperations = [...formData.operations];

    newOperations[index] = {
      ...newOperations[index],
      [field]: value,
    };

    await updateWebhook({
      operations: addEmptyOperationIfNecessary(newOperations),
    });
  };

  const removeOperation = async (index: number) => {
    const newOperations = formData.operations.filter((_, i) => i !== index);
    await updateWebhook({
      operations: addEmptyOperationIfNecessary(newOperations),
    });
  };

  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const deleteWebhook = async () => {
    await deleteOneWebhook(webhookId);
    navigate(SettingsPath.Webhooks);
  };

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
      setFormData({
        targetUrl: data.targetUrl,
        description: data.description,
        operations,
        secret: data.secret,
      });
      if (isValidUrl(data.targetUrl)) {
        setTitle(getUrlHostnameOrThrow(data.targetUrl));
      }

      setLoading(false);
    },
  });

  return {
    formData,
    title,
    isTargetUrlValid,
    updateWebhook,
    updateOperation,
    removeOperation,
    deleteWebhook,
    loading,
  };
};
