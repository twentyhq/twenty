import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { type WebhookOperationType } from '@/settings/developers/types/WebhookOperationsType';
import { addEmptyOperationIfNecessary } from '@/settings/developers/utils/addEmptyOperationIfNecessary';
import {
  createWebhookCreateInput,
  createWebhookUpdateInput,
} from '@/settings/developers/utils/createWebhookInput';
import { getWebhookConditionObjectNameSingular } from '@/settings/developers/utils/getWebhookConditionObjectNameSingular';
import { parseOperationsFromStrings } from '@/settings/developers/utils/parseOperationsFromStrings';
import {
  getWebhookFormSchema,
  type WebhookFormValues,
} from '@/settings/developers/validation-schemas/webhookFormSchema';
import { useMutation, useQuery } from '@apollo/client/react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  CreateWebhookDocument,
  DeleteWebhookDocument,
  GetApiKeyRolesDocument,
  GetWebhookDocument,
  UpdateWebhookDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { useLingui } from '@lingui/react/macro';

type UseWebhookFormProps = {
  webhookId?: string;
  mode: WebhookFormMode;
};

const DEFAULT_FORM_VALUES: WebhookFormValues = {
  targetUrl: '',
  description: '',
  operations: addEmptyOperationIfNecessary([{ object: '*', action: '*' }]),
  condition: '',
  secret: '',
  roleId: '',
};

export const useWebhookForm = ({ webhookId, mode }: UseWebhookFormProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();

  const isCreationMode = mode === WebhookFormMode.Create;

  const [createWebhook] = useMutation(CreateWebhookDocument);
  const [updateWebhook] = useMutation(UpdateWebhookDocument);
  const [deleteWebhook] = useMutation(DeleteWebhookDocument);

  const formConfig = useForm<WebhookFormValues>({
    mode: isCreationMode ? 'onSubmit' : 'onTouched',
    resolver: zodResolver(getWebhookFormSchema()),
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

  const {
    data: rolesData,
    loading: rolesLoading,
    error: rolesError,
  } = useQuery(GetApiKeyRolesDocument);
  const roles = rolesData?.getApiKeyRoles ?? [];

  useEffect(() => {
    if (webhookData) {
      const webhook = webhookData.webhook;
      if (!webhook) {
        return;
      }

      const baseOperations = webhook?.operations?.length
        ? parseOperationsFromStrings(webhook.operations)
        : [];
      const operations = addEmptyOperationIfNecessary(baseOperations);

      formConfig.reset({
        targetUrl: webhook.targetUrl || '',
        description: webhook.description || '',
        operations,
        condition: webhook.condition ?? '',
        secret: webhook.secret || '',
        roleId: webhook.role?.id ?? '',
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

      navigate(
        createdWebhook ? SettingsPath.WebhookDetail : SettingsPath.Developers,
        createdWebhook ? { webhookId: createdWebhook.id } : undefined,
        undefined,
        undefined,
        createdWebhook ? undefined : SETTINGS_DEVELOPERS_TABS.TABS_IDS.WEBHOOKS,
      );
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

  const setOperations = (nextOperations: WebhookOperationType[]) => {
    const previousConditionObjectNameSingular =
      getWebhookConditionObjectNameSingular(formConfig.getValues('operations'));
    const operations = addEmptyOperationIfNecessary(nextOperations);
    const conditionObjectNameSingular =
      getWebhookConditionObjectNameSingular(operations);

    formConfig.setValue('operations', operations, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // A condition reads the fields of one object, so it can't follow a switch to another
    if (
      isDefined(previousConditionObjectNameSingular) &&
      isDefined(conditionObjectNameSingular) &&
      previousConditionObjectNameSingular !== conditionObjectNameSingular
    ) {
      formConfig.setValue('condition', '', { shouldDirty: true });
    }
  };

  const updateOperation = (
    index: number,
    field: 'object' | 'action',
    value: string | null,
  ) => {
    const newOperations = [...formConfig.getValues('operations')];

    newOperations[index] = {
      ...newOperations[index],
      [field]: value,
    };

    setOperations(newOperations);
  };

  const removeOperation = (index: number) => {
    setOperations(
      formConfig.getValues('operations').filter((_, i) => i !== index),
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

      navigate(
        SettingsPath.Developers,
        undefined,
        undefined,
        undefined,
        SETTINGS_DEVELOPERS_TABS.TABS_IDS.WEBHOOKS,
      );
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return {
    formConfig,
    loading: loading || rolesLoading,
    roles,
    canSave,
    handleSave,
    updateOperation,
    removeOperation,
    handleDelete,
    isCreationMode,
    error: error ?? rolesError,
  };
};
