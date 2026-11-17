import { useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsMcpServerConnectionsSection } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionsSection';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
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
import {
  ApplicationConnectionProvidersDocument,
  ConnectionProviderScope,
  type McpServerFragmentFragment,
} from '~/generated-metadata/graphql';

type SettingsMcpServerEditFormProps = {
  mcpServer: McpServerFragmentFragment;
};

export const SettingsMcpServerEditForm = ({
  mcpServer,
}: SettingsMcpServerEditFormProps) => {
  const { t } = useLingui();
  const { updateMcpServer } = useUpdateMcpServer();
  const { navigateToMcpServersList } = useNavigateToMcpServersList();

  const formConfig = useForm<McpServerFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(getMcpServerFormSchema()),
    defaultValues: getMcpServerFormValues(mcpServer),
  });

  const { isDirty, isValid, isSubmitting } = formConfig.formState;

  const {
    data: connectionProvidersData,
    error: connectionProvidersError,
    refetch: refetchConnectionProviders,
  } = useQuery(ApplicationConnectionProvidersDocument, {
    variables: { applicationId: mcpServer.applicationId },
    skip: !isDefined(mcpServer.connectionProviderId),
  });
  const perMemberConnectionProvider =
    connectionProvidersData?.applicationConnectionProviders.find(
      (connectionProvider) =>
        connectionProvider.id === mcpServer.connectionProviderId &&
        connectionProvider.scope === ConnectionProviderScope.USER,
    );

  const handleSave = async ({ label, url }: McpServerFormValues) => {
    const savedFormValues = getMcpServerFormValues(mcpServer);

    const update = {
      ...(label !== savedFormValues.label && { label }),
      ...(url !== savedFormValues.url && { url }),
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
        {isDefined(connectionProvidersError) ? (
          <SettingsApplicationLoadErrorBanner
            message={t`The sign-in for this server could not be loaded. Check your connection and try again.`}
            onRetry={() => refetchConnectionProviders().catch(() => undefined)}
          />
        ) : (
          isDefined(perMemberConnectionProvider) && (
            <SettingsMcpServerConnectionsSection
              mcpServerId={mcpServer.id}
              connectionProvider={perMemberConnectionProvider}
            />
          )
        )}
        <SettingsMcpServerToolsSection mcpServer={mcpServer} />
        <SettingsMcpServerDangerZone mcpServer={mcpServer} />
      </SettingsMcpServerFormLayout>
    </FormProvider>
  );
};
