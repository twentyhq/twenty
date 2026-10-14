import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { addEmptyOperationIfNecessary } from '@/settings/developers/utils/addEmptyOperationIfNecessary';
import {
  createWebhookCreateInput,
  createWebhookUpdateInput,
} from '@/settings/developers/utils/createWebhookInput';
import { parseOperationsFromStrings } from '@/settings/developers/utils/parseOperationsFromStrings';
import {
  webhookFormSchema,
  type WebhookFormValues,
} from '@/settings/developers/validation-schemas/webhookFormSchema';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  CreateWebhookDocument,
  DeleteWebhookDocument,
  GetWebhookDocument,
  GetWebhooksDocument,
  UpdateWebhookDocument,
} from '~/generated-metadata/graphql';

type UseWebhookFormProps = {
  webhookId?: string;
  onCreated: (webhookId: string) => void;
  onDeleted: () => void;
};

const DEFAULT_FORM_VALUES: WebhookFormValues = {
  targetUrl: '',
  description: '',
  operations: addEmptyOperationIfNecessary([{ object: '*', action: '*' }]),
  secret: '',
};

export const useWebhookForm = ({
  webhookId,
  onCreated,
  onDeleted,
}: UseWebhookFormProps) => {
  const { enqueueToast } = useToast();

  const isCreationMode = !isDefined(webhookId);

  const [createWebhook] = useMutation(CreateWebhookDocument, {
    refetchQueries: [GetWebhooksDocument],
  });
  const [updateWebhook] = useMutation(UpdateWebhookDocument);
  const [deleteWebhook] = useMutation(DeleteWebhookDocument, {
    refetchQueries: [GetWebhooksDocument],
  });

  const formConfig = useForm<WebhookFormValues>({
    mode: isCreationMode ? 'onSubmit' : 'onTouched',
    resolver: zodResolver(webhookFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    loading,
    error,
    data: webhookData,
  } = useQuery(GetWebhookDocument, {
    skip: isCreationMode,
    variables: {
      id: webhookId || '',
    },
  });

  useEffect(() => {
    if (webhookData) {
      const webhook = webhookData.webhook;
      if (!webhook) return;

      const baseOperations = webhook?.operations?.length
        ? parseOperationsFromStrings(webhook.operations)
        : [];
      const operations = addEmptyOperationIfNecessary(baseOperations);

      formConfig.reset({
        targetUrl: webhook.targetUrl || '',
        description: webhook.description || '',
        operations,
        secret: webhook.secret || '',
      });
    }
  }, [webhookData, formConfig]);

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isCreationMode
    ? isValid && !isSubmitting
    : isDirty && isValid && !isSubmitting;

  const handleCreate = async (formValues: WebhookFormValues) => {
    try {
      const input = createWebhookCreateInput(formValues);
      const { data } = await createWebhook({ variables: { input } });
      const createdWebhook = data?.createWebhook;

      const targetUrl = createdWebhook?.targetUrl
        ? `${createdWebhook?.targetUrl}`
        : '';

      enqueueToast({
        status: 'success',
        children: t`Webhook ${targetUrl} created successfully`,
      });

      if (isDefined(createdWebhook)) {
        onCreated(createdWebhook.id);
      }
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleUpdate = async (formValues: WebhookFormValues) => {
    if (!webhookId) {
      enqueueToast({
        status: 'error',
        children: t`Webhook ID is required for updates`,
      });
      return;
    }

    try {
      const input = createWebhookUpdateInput(formValues);
      const { data } = await updateWebhook({
        variables: { input: { id: webhookId, update: input } },
      });
      const updatedWebhook = data?.updateWebhook;

      formConfig.reset(formValues);

      const targetUrl = updatedWebhook?.targetUrl
        ? `${updatedWebhook.targetUrl}`
        : '';

      enqueueToast({
        status: 'success',
        children: t`Webhook ${targetUrl} updated successfully`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
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
      enqueueToast({
        status: 'error',
        children: t`Webhook ID is required for deletion`,
      });
      return;
    }

    try {
      await deleteWebhook({
        variables: { id: webhookId },
      });
      enqueueToast({
        status: 'success',
        children: t`Webhook deleted successfully`,
      });

      onDeleted();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
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
