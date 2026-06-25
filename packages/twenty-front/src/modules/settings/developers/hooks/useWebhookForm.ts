import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
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
import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CreateWebhookDocument,
  DeleteWebhookDocument,
  GetWebhookDocument,
  UpdateWebhookDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UseWebhookFormProps = {
  webhookId?: string;
  mode: WebhookFormMode;
};

const DEFAULT_FORM_VALUES: WebhookFormValues = {
  targetUrl: '',
  description: '',
  operations: addEmptyOperationIfNecessary([{ object: '*', action: '*' }]),
  secret: '',
};

export const useWebhookForm = ({ webhookId, mode }: UseWebhookFormProps) => {
  const navigate = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const isCreationMode = mode === WebhookFormMode.Create;

  const [createWebhook] = useMutation(CreateWebhookDocument);
  const [updateWebhook] = useMutation(UpdateWebhookDocument);
  const [deleteWebhook] = useMutation(DeleteWebhookDocument);

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
    skip: isCreationMode || !webhookId,
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

  useSnackBarOnQueryError(error, t`Failed to load webhook`);

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

      enqueueSuccessSnackBar({
        message: t`Webhook ${targetUrl} created successfully`,
      });

      navigate(
        createdWebhook ? SettingsPath.WebhookDetail : SettingsPath.ApiWebhooks,
        createdWebhook ? { webhookId: createdWebhook.id } : undefined,
      );
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  const handleUpdate = async (formValues: WebhookFormValues) => {
    if (!webhookId) {
      enqueueErrorSnackBar({
        message: t`Webhook ID is required for updates`,
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

      enqueueSuccessSnackBar({
        message: t`Webhook ${targetUrl} updated successfully`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
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
      enqueueErrorSnackBar({
        message: t`Webhook ID is required for deletion`,
      });
      return;
    }

    try {
      await deleteWebhook({
        variables: { id: webhookId },
      });
      enqueueSuccessSnackBar({
        message: t`Webhook deleted successfully`,
      });

      navigate(SettingsPath.ApiWebhooks);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
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
