import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';

import { SettingsMcpServerDangerZone } from '@/settings/mcp-servers/components/SettingsMcpServerDangerZone';
import { SettingsMcpServerFormFields } from '@/settings/mcp-servers/components/SettingsMcpServerFormFields';
import { SettingsMcpServerFormLayout } from '@/settings/mcp-servers/components/SettingsMcpServerFormLayout';
import { SettingsMcpServerToolsSection } from '@/settings/mcp-servers/components/SettingsMcpServerToolsSection';
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

  const formConfig = useForm<McpServerFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(getMcpServerFormSchema()),
    defaultValues: getMcpServerFormValues(mcpServer),
  });

  const handleSave = async ({
    label,
    url,
    connectionProviderId,
  }: McpServerFormValues) => {
    const savedFormValues = getMcpServerFormValues(mcpServer);

    const updatedMcpServer = await updateMcpServer({
      mcpServerId: mcpServer.id,
      update: {
        ...(label !== savedFormValues.label && { label }),
        ...(url !== savedFormValues.url && { url }),
        ...(connectionProviderId !== savedFormValues.connectionProviderId && {
          connectionProviderId,
        }),
      },
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
        onSave={handleSave}
      >
        <SettingsMcpServerFormFields mcpServer={mcpServer} />
        <SettingsMcpServerToolsSection mcpServer={mcpServer} />
        <SettingsMcpServerDangerZone mcpServer={mcpServer} />
      </SettingsMcpServerFormLayout>
    </FormProvider>
  );
};
