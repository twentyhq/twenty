import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useState } from 'react';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { useDebouncedCallback } from 'use-debounce';
import { WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';
import { isDefined } from 'twenty-shared';
import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { SettingsPath } from '@/types/SettingsPath';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { isValidUrl } from '~/utils/url/isValidUrl';
import { getUrlHostname } from '~/utils/url/getUrlHostname';

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
    operations: [],
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

  const validateData = (data: Partial<WebhookFormData>) => {
    if (isDefined(data?.targetUrl)) {
      const trimmedUrl = data.targetUrl.trim();
      const isTargetUrlValid = isValidUrl(trimmedUrl);
      setIsTargetUrlValid(isTargetUrlValid);
      if (isTargetUrlValid) {
        setTitle(
          getUrlHostname(trimmedUrl, { keepPath: true }) || 'New Webhook',
        );
      }
    }
  };

  const updateWebhook = async (data: Partial<WebhookFormData>) => {
    validateData(data);
    setFormData((prev) => ({ ...prev, ...data }));
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
    navigate(SettingsPath.Developers);
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
      setTitle(
        getUrlHostname(data.targetUrl, { keepPath: true }) || 'New Webhook',
      );
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
