import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useMutation, useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import {
  getMcpServerFormSchema,
  type McpServerFormValues,
} from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import {
  CreateMcpServerDocument,
  DeleteMcpServerDocument,
  FindManyMcpServersDocument,
  FindOneMcpServerDocument,
  SyncMcpServerToolsDocument,
  UpdateMcpServerDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UseMcpServerFormProps = {
  mcpServerId?: string;
};

const DEFAULT_FORM_VALUES: McpServerFormValues = {
  label: '',
  name: '',
  url: '',
  connectionProviderId: null,
  isActive: true,
};

export const useMcpServerForm = ({ mcpServerId }: UseMcpServerFormProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();

  const isCreationMode = !isDefined(mcpServerId);

  const [createMcpServer] = useMutation(CreateMcpServerDocument, {
    refetchQueries: [FindManyMcpServersDocument],
  });
  const [updateMcpServer] = useMutation(UpdateMcpServerDocument);
  const [deleteMcpServer] = useMutation(DeleteMcpServerDocument, {
    refetchQueries: [FindManyMcpServersDocument],
  });
  const [syncMcpServerTools, { loading: isSyncingTools }] = useMutation(
    SyncMcpServerToolsDocument,
  );

  const formConfig = useForm<McpServerFormValues>({
    mode: isCreationMode ? 'onSubmit' : 'onTouched',
    resolver: zodResolver(getMcpServerFormSchema()),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { loading, error, data } = useQuery(FindOneMcpServerDocument, {
    skip: isCreationMode,
    variables: { id: mcpServerId ?? '' },
  });

  const mcpServer = data?.mcpServer ?? null;

  useEffect(() => {
    if (!isDefined(mcpServer)) {
      return;
    }

    formConfig.reset({
      label: mcpServer.label,
      name: mcpServer.name,
      url: mcpServer.url,
      connectionProviderId: mcpServer.connectionProviderId ?? null,
      isActive: mcpServer.isActive,
    });
  }, [mcpServer, formConfig]);

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isCreationMode
    ? isValid && !isSubmitting
    : isDirty && isValid && !isSubmitting;

  const navigateToMcpServersTab = () =>
    navigate(
      SettingsPath.Developers,
      undefined,
      undefined,
      undefined,
      SETTINGS_DEVELOPERS_TABS.TABS_IDS.MCP_SERVERS,
    );

  const handleCreate = async (formValues: McpServerFormValues) => {
    try {
      const { data } = await createMcpServer({
        variables: { input: formValues },
      });
      const createdMcpServer = data?.createMcpServer;

      enqueueToast({
        status: 'success',
        children: t`MCP server ${formValues.label} created successfully`,
      });

      if (isDefined(createdMcpServer)) {
        navigate(SettingsPath.McpServerDetail, {
          mcpServerId: createdMcpServer.id,
        });
      } else {
        navigateToMcpServersTab();
      }
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleUpdate = async (formValues: McpServerFormValues) => {
    if (!isDefined(mcpServerId)) {
      return;
    }

    try {
      const { label, url, connectionProviderId, isActive } = formValues;

      await updateMcpServer({
        variables: {
          input: {
            id: mcpServerId,
            update: { label, url, connectionProviderId, isActive },
          },
        },
      });

      formConfig.reset(formValues);

      enqueueToast({
        status: 'success',
        children: t`MCP server ${label} updated successfully`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleSave = isCreationMode ? handleCreate : handleUpdate;

  const handleSyncTools = async () => {
    if (!isDefined(mcpServerId)) {
      return;
    }

    try {
      const { data } = await syncMcpServerTools({
        variables: { id: mcpServerId },
      });
      const syncedMcpServer = data?.syncMcpServerTools;

      if (isNonEmptyString(syncedMcpServer?.toolsSyncError)) {
        enqueueToast({
          status: 'error',
          children: syncedMcpServer.toolsSyncError,
        });
        return;
      }

      const toolCount = syncedMcpServer?.tools.length ?? 0;

      enqueueToast({
        status: 'success',
        children: t`Synced ${toolCount} tools`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

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

      navigateToMcpServersTab();
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
    handleSyncTools,
    handleDelete,
    navigateToMcpServersTab,
  };
};
