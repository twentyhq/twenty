import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsMcpServerFormFields } from '@/settings/mcp-servers/components/SettingsMcpServerFormFields';
import { SettingsMcpServerFormLayout } from '@/settings/mcp-servers/components/SettingsMcpServerFormLayout';
import { MCP_SERVER_FORM_DEFAULT_VALUES } from '@/settings/mcp-servers/constants/McpServerFormDefaultValues';
import { useCreateMcpServer } from '@/settings/mcp-servers/hooks/useCreateMcpServer';
import { useNavigateToMcpServersList } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersList';
import {
  getMcpServerFormSchema,
  type McpServerFormValues,
} from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';

export const SettingsMcpServerNewForm = () => {
  const { t } = useLingui();
  const { createMcpServer } = useCreateMcpServer();
  const { navigateToMcpServersList } = useNavigateToMcpServersList();

  const formConfig = useForm<McpServerFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(getMcpServerFormSchema()),
    defaultValues: MCP_SERVER_FORM_DEFAULT_VALUES,
  });

  const { isDirty, isValid, isSubmitting } = formConfig.formState;

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsMcpServerFormLayout
        title={t`New MCP server`}
        breadcrumbTitle={t`New`}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!isDirty || !isValid || isSubmitting}
            isCancelDisabled={isSubmitting}
            onCancel={navigateToMcpServersList}
            onSave={formConfig.handleSubmit(createMcpServer)}
          />
        }
      >
        <SettingsMcpServerFormFields />
      </SettingsMcpServerFormLayout>
    </FormProvider>
  );
};
