import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsMcpServerConnectionsSection } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionsSection';
import { SettingsMcpServerDangerZone } from '@/settings/mcp-servers/components/SettingsMcpServerDangerZone';
import { SettingsMcpServerFormFields } from '@/settings/mcp-servers/components/SettingsMcpServerFormFields';
import { SettingsMcpServerFormLayout } from '@/settings/mcp-servers/components/SettingsMcpServerFormLayout';
import { SettingsMcpServerToolsSection } from '@/settings/mcp-servers/components/SettingsMcpServerToolsSection';
import { useNavigateToMcpServersList } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersList';
import { useUpdateMcpServer } from '@/settings/mcp-servers/hooks/useUpdateMcpServer';
import { getMcpServerFormValues } from '@/settings/mcp-servers/utils/getMcpServerFormValues';
import {
  getMcpServerFormSchema,
  type McpServerFormValues,
} from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { type McpServerFragmentFragment } from '~/generated-metadata/graphql';

type SettingsMcpServerEditFormProps = {
  mcpServer: McpServerFragmentFragment;
};

export const SettingsMcpServerEditForm = ({
  mcpServer,
}: SettingsMcpServerEditFormProps) => {
  const { updateMcpServer } = useUpdateMcpServer();
  const { navigateToMcpServersList } = useNavigateToMcpServersList();

  const formConfig = useForm<McpServerFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(getMcpServerFormSchema()),
    defaultValues: getMcpServerFormValues(mcpServer),
  });

  const { isDirty, isValid, isSubmitting } = formConfig.formState;

  const handleSave = async ({
    label,
    url,
    connectionProviderId,
  }: McpServerFormValues) => {
    const savedFormValues = getMcpServerFormValues(mcpServer);

    const update = {
      ...(label !== savedFormValues.label && { label }),
      ...(url !== savedFormValues.url && { url }),
      ...(connectionProviderId !== savedFormValues.connectionProviderId && {
        connectionProviderId,
      }),
    };

    if (isEmptyObject(update)) {
      formConfig.reset(savedFormValues);
      return;
    }

    const updatedMcpServer = await updateMcpServer({
      mcpServerId: mcpServer.id,
      update,
    });

    if (isDefined(updatedMcpServer)) {
      formConfig.reset(getMcpServerFormValues(updatedMcpServer));
    }
  };

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsMcpServerFormLayout
        title={mcpServer.label}
        breadcrumbTitle={mcpServer.label}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!isDirty || !isValid || isSubmitting}
            isCancelDisabled={isSubmitting}
            onCancel={navigateToMcpServersList}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsMcpServerFormFields mcpServer={mcpServer} />
        {!isDefined(mcpServer.connectionProviderId) && (
          <SettingsMcpServerConnectionsSection mcpServerId={mcpServer.id} />
        )}
        <SettingsMcpServerToolsSection mcpServer={mcpServer} />
        <SettingsMcpServerDangerZone mcpServer={mcpServer} />
      </SettingsMcpServerFormLayout>
    </FormProvider>
  );
};
