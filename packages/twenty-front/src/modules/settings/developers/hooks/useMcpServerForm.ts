import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { McpServerFormMode } from '@/settings/developers/constants/McpServerFormMode';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import {
  createMcpServerCreateInput,
  createMcpServerUpdateInput,
} from '@/settings/developers/utils/createMcpServerInput';
import {
  getMcpServerFormSchema,
  type McpServerFormValues,
} from '@/settings/developers/validation-schemas/mcpServerFormSchema';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  CreateMcpServerDocument,
  DeleteMcpServerDocument,
  GetMcpServerDocument,
  GetMcpServersDocument,
  SyncMcpServerToolsDocument,
  UpdateMcpServerDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UseMcpServerFormProps = {
  mcpServerId?: string;
  mode: McpServerFormMode;
};

const DEFAULT_FORM_VALUES: McpServerFormValues = {
  name: '',
  label: '',
  url: '',
  authorizationHeaderValue: '',
  shouldClearAuthorizationHeader: false,
  isEnabled: true,
};

export const useMcpServerForm = ({
  mcpServerId,
  mode,
}: UseMcpServerFormProps) => {
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();

  const isCreationMode = mode === McpServerFormMode.Create;

  const [createMcpServer] = useMutation(CreateMcpServerDocument, {
    refetchQueries: [GetMcpServersDocument],
  });
  const [updateMcpServer] = useMutation(UpdateMcpServerDocument);
  const [deleteMcpServer] = useMutation(DeleteMcpServerDocument, {
    refetchQueries: [GetMcpServersDocument],
  });
  const [syncMcpServerTools, { loading: isSyncingTools }] = useMutation(
    SyncMcpServerToolsDocument,
  );

  const formConfig = useForm<McpServerFormValues>({
    mode: isCreationMode ? 'onSubmit' : 'onTouched',
    resolver: zodResolver(getMcpServerFormSchema()),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    loading,
    error,
    data: mcpServerData,
  } = useQuery(GetMcpServerDocument, {
    skip: isCreationMode || !isDefined(mcpServerId),
    variables: { id: mcpServerId ?? '' },
  });

  const mcpServer = mcpServerData?.mcpServer ?? null;

  useEffect(() => {
    if (!isDefined(mcpServer)) {
      return;
    }

    formConfig.reset({
      name: mcpServer.name,
      label: mcpServer.label,
      url: mcpServer.url,
      authorizationHeaderValue: '',
      shouldClearAuthorizationHeader: false,
      isEnabled: mcpServer.isEnabled,
    });
  }, [mcpServer, formConfig]);

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isCreationMode
    ? isValid && !isSubmitting
    : isDirty && isValid && !isSubmitting;

  const handleCreate = async (formValues: McpServerFormValues) => {
    try {
      const { data } = await createMcpServer({
        variables: { input: createMcpServerCreateInput(formValues) },
      });
      const createdMcpServer = data?.createMcpServer;

      enqueueToast({
        status: 'success',
        children: t`MCP server ${formValues.label} created successfully`,
      });

      navigate(
        isDefined(createdMcpServer)
          ? SettingsPath.McpServerDetail
          : SettingsPath.Developers,
        isDefined(createdMcpServer)
          ? { mcpServerId: createdMcpServer.id }
          : undefined,
        undefined,
        undefined,
        isDefined(createdMcpServer)
          ? undefined
          : SETTINGS_DEVELOPERS_TABS.TABS_IDS.MCP_SERVERS,
      );
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleUpdate = async (formValues: McpServerFormValues) => {
    if (!isDefined(mcpServerId)) {
      return;
    }

    try {
      await updateMcpServer({
        variables: {
          input: {
            id: mcpServerId,
            update: createMcpServerUpdateInput(formValues),
          },
        },
      });

      formConfig.reset({
        ...formValues,
        authorizationHeaderValue: '',
        shouldClearAuthorizationHeader: false,
      });

      enqueueToast({
        status: 'success',
        children: t`MCP server ${formValues.label} updated successfully`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleSave = isCreationMode ? handleCreate : handleUpdate;

  const handleDelete = async () => {
    if (!isDefined(mcpServerId)) {
      return;
    }

    try {
      await deleteMcpServer({ variables: { id: mcpServerId } });

      enqueueToast({
        status: 'success',
        children: t`MCP server deleted successfully`,
      });

      navigate(
        SettingsPath.Developers,
        undefined,
        undefined,
        undefined,
        SETTINGS_DEVELOPERS_TABS.TABS_IDS.MCP_SERVERS,
      );
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleSyncTools = async () => {
    if (!isDefined(mcpServerId)) {
      return;
    }

    try {
      const { data } = await syncMcpServerTools({
        variables: { id: mcpServerId },
      });
      const syncedMcpServer = data?.syncMcpServerTools;

      if (isDefined(syncedMcpServer?.toolsSyncError)) {
        enqueueToast({
          status: 'error',
          children: t`Could not refresh tools: ${syncedMcpServer.toolsSyncError}`,
        });

        return;
      }

      const toolCount = syncedMcpServer?.tools.length ?? 0;

      enqueueToast({
        status: 'success',
        children: t`Refreshed ${toolCount} tools`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return {
    formConfig,
    mcpServer,
    loading,
    error,
    canSave,
    isCreationMode,
    isSyncingTools,
    handleSave,
    handleDelete,
    handleSyncTools,
  };
};
