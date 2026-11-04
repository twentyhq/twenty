import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, FormProvider } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPower, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { SettingsMcpServerConnectionProviderSelect } from '@/settings/mcp-servers/components/SettingsMcpServerConnectionProviderSelect';
import { SettingsMcpServerToolsSection } from '@/settings/mcp-servers/components/SettingsMcpServerToolsSection';
import { useMcpServerForm } from '@/settings/mcp-servers/hooks/useMcpServerForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

const DELETE_MCP_SERVER_DIALOG_ID = 'delete-mcp-server-dialog';

type SettingsMcpServerFormProps = {
  mcpServerId?: string;
};

export const SettingsMcpServerForm = ({
  mcpServerId,
}: SettingsMcpServerFormProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const {
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
  } = useMcpServerForm({ mcpServerId });

  if (loading || isDefined(error)) {
    return (
      <>
        <ToastOnQueryErrorEffect
          error={error}
          message={t`Failed to load MCP server`}
        />
        <SettingsSkeletonLoader />
      </>
    );
  }

  const title = isCreationMode ? t`New MCP server` : (mcpServer?.label ?? '');
  const instanceIdPrefix = mcpServerId ?? 'new-mcp-server';

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsPageLayout
        title={title}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          {
            children: t`Developers`,
            href: getSettingsPath(
              SettingsPath.Developers,
              undefined,
              undefined,
              SETTINGS_DEVELOPERS_TABS.TABS_IDS.MCP_SERVERS,
            ),
          },
          { children: isCreationMode ? t`New` : title },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={formConfig.formState.isSubmitting}
            onCancel={navigateToMcpServersTab}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section.Root>
            <Section.Header
              title={t`Label`}
              description={t`The name shown to your team and to agents.`}
            />
            <Controller
              name="label"
              control={formConfig.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <SettingsTextInput
                  instanceId={`${instanceIdPrefix}-label`}
                  placeholder={t`Linear`}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                  autoFocus={isCreationMode}
                />
              )}
            />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Name`}
              description={t`Identifier prefixed to the tool names exposed to agents. Lowercase letters, digits and underscores; cannot be changed later.`}
            />
            <Controller
              name="name"
              control={formConfig.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <SettingsTextInput
                  instanceId={`${instanceIdPrefix}-name`}
                  placeholder={t`linear`}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  disabled={!isCreationMode}
                  fullWidth
                />
              )}
            />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`URL`}
              description={t`The HTTP endpoint of the remote MCP server.`}
            />
            <Controller
              name="url"
              control={formConfig.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <SettingsTextInput
                  instanceId={`${instanceIdPrefix}-url`}
                  placeholder={t`https://mcp.example.com/mcp`}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Connection provider`}
              description={t`Optional provider whose connected account authenticates calls to this server.`}
            />
            <Controller
              name="connectionProviderId"
              control={formConfig.control}
              render={({ field: { onChange, value } }) => (
                <SettingsMcpServerConnectionProviderSelect
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Status`}
              description={t`Inactive servers keep their settings but their tools are not offered to agents.`}
            />
            <Controller
              name="isActive"
              control={formConfig.control}
              render={({ field: { onChange, value } }) => (
                <Card.Root>
                  <SettingsOptionCardContentSwitch
                    Icon={IconPower}
                    title={t`Active`}
                    checked={value}
                    onChange={onChange}
                  />
                </Card.Root>
              )}
            />
          </Section.Root>
          {!isCreationMode && isDefined(mcpServer) && (
            <SettingsMcpServerToolsSection
              mcpServer={mcpServer}
              isSyncing={isSyncingTools}
              onSync={handleSyncTools}
            />
          )}
          {!isCreationMode && (
            <Section.Root>
              <Section.Header
                title={t`Danger zone`}
                description={t`Delete this MCP server`}
              />
              <Button
                startIcon={<IconTrash />}
                onClick={() => openDialog(DELETE_MCP_SERVER_DIALOG_ID)}
                variant="outline"
                color="danger"
              >{t`Delete`}</Button>
            </Section.Root>
          )}
        </SettingsPageContainer>
      </SettingsPageLayout>
      {!isCreationMode && (
        <ConfirmationDialog
          confirmationPlaceholder={t`yes`}
          confirmationValue={t`yes`}
          dialogId={DELETE_MCP_SERVER_DIALOG_ID}
          title={t`Delete MCP server`}
          subtitle={
            <Trans>
              Please type "yes" to confirm you want to delete this MCP server.
            </Trans>
          }
          onConfirmClick={handleDelete}
          confirmButtonText={t`Delete`}
        />
      )}
    </FormProvider>
  );
};
