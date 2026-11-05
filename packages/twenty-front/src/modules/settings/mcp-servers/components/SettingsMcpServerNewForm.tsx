import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';

import { SettingsMcpServerFormFields } from '@/settings/mcp-servers/components/SettingsMcpServerFormFields';
import { SettingsMcpServerFormLayout } from '@/settings/mcp-servers/components/SettingsMcpServerFormLayout';
import { MCP_SERVER_FORM_DEFAULT_VALUES } from '@/settings/mcp-servers/constants/McpServerFormDefaultValues';
import { useCreateMcpServer } from '@/settings/mcp-servers/hooks/useCreateMcpServer';
import {
  getMcpServerFormSchema,
  type McpServerFormValues,
} from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';

export const SettingsMcpServerNewForm = () => {
  const { t } = useLingui();
  const { createMcpServer } = useCreateMcpServer();

  const formConfig = useForm<McpServerFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(getMcpServerFormSchema()),
    defaultValues: MCP_SERVER_FORM_DEFAULT_VALUES,
  });

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsMcpServerFormLayout
        title={t`New MCP server`}
        breadcrumbTitle={t`New`}
        onSave={createMcpServer}
      >
        <SettingsMcpServerFormFields />
      </SettingsMcpServerFormLayout>
    </FormProvider>
  );
};
