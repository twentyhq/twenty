import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { Controller, FormProvider } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsDevelopersMcpServerToolsSection } from '@/settings/developers/components/SettingsDevelopersMcpServerToolsSection';
import { type McpServerFormMode } from '@/settings/developers/constants/McpServerFormMode';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { useMcpServerForm } from '@/settings/developers/hooks/useMcpServerForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_MCP_SERVER_MODAL_ID = 'delete-mcp-server-modal';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledAuthorizationRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAuthorizationInput = styled.div`
  flex: 1;
`;

const StyledAuthorizationStatus = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type SettingsDevelopersMcpServerFormProps = {
  mcpServerId?: string;
  mode: McpServerFormMode;
};

export const SettingsDevelopersMcpServerForm = ({
  mcpServerId,
  mode,
}: SettingsDevelopersMcpServerFormProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { openDialog } = useDialog();
  const {
    formConfig,
    mcpServer,
    loading,
    error,
    canSave,
    isCreationMode,
    isReadonly,
    isSyncingTools,
    handleSave,
    handleDelete,
    handleSyncTools,
  } = useMcpServerForm({ mcpServerId, mode });

  const title = isCreationMode
    ? t`New MCP server`
    : (mcpServer?.label ?? t`MCP server`);

  if ((loading && !isCreationMode) || isDefined(error)) {
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

  const inputInstanceIdPrefix = mcpServerId ?? 'new-mcp-server';
  const hasStoredAuthorizationHeader =
    mcpServer?.hasAuthorizationHeader === true;
  const isAuthorizationHeaderCleared = formConfig.watch(
    'shouldClearAuthorizationHeader',
  );

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
          isReadonly ? undefined : (
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              isCancelDisabled={formConfig.formState.isSubmitting}
              onCancel={() =>
                navigate(
                  SettingsPath.Developers,
                  undefined,
                  undefined,
                  undefined,
                  SETTINGS_DEVELOPERS_TABS.TABS_IDS.MCP_SERVERS,
                )
              }
              onSave={formConfig.handleSubmit(handleSave)}
            />
          )
        }
      >
        <SettingsPageContainer>
          <Section.Root>
            <Section.Header
              title={t`Server`}
              description={
                isReadonly
                  ? t`This server is declared by an installed app and follows its manifest.`
                  : t`The name prefixes every tool of this server in the AI chat, the label is what people see.`
              }
            />
            <StyledInputsContainer>
              <Controller
                name="label"
                control={formConfig.control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <SettingsTextInput
                    instanceId={`${inputInstanceIdPrefix}-label`}
                    label={t`Label`}
                    placeholder={t`Documentation`}
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    fullWidth
                    autoFocus={isCreationMode}
                    disabled={isReadonly}
                  />
                )}
              />
              <Controller
                name="name"
                control={formConfig.control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <SettingsTextInput
                    instanceId={`${inputInstanceIdPrefix}-name`}
                    label={t`Name`}
                    placeholder={t`documentation`}
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    fullWidth
                    disabled={isReadonly}
                  />
                )}
              />
              <Controller
                name="url"
                control={formConfig.control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <SettingsTextInput
                    instanceId={`${inputInstanceIdPrefix}-url`}
                    label={t`URL`}
                    placeholder={t`https://example.com/mcp`}
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    fullWidth
                    disabled={isReadonly}
                  />
                )}
              />
            </StyledInputsContainer>
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Authorization`}
              description={t`Optional value sent as the Authorization header, for example "Bearer <token>". It is stored encrypted and never shown again.`}
            />
            <StyledInputsContainer>
              <Controller
                name="authorizationHeaderValue"
                control={formConfig.control}
                render={({ field: { onChange, value } }) => (
                  <StyledAuthorizationRow>
                    <StyledAuthorizationInput>
                      <SettingsTextInput
                        instanceId={`${inputInstanceIdPrefix}-authorization`}
                        type="password"
                        placeholder={
                          hasStoredAuthorizationHeader &&
                          !isAuthorizationHeaderCleared
                            ? t`Enter a new value to replace it`
                            : t`Bearer <token>`
                        }
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue);
                          formConfig.setValue(
                            'shouldClearAuthorizationHeader',
                            false,
                            { shouldDirty: true },
                          );
                        }}
                        fullWidth
                        ignorePasswordManagers
                        disabled={isReadonly}
                      />
                    </StyledAuthorizationInput>
                    {hasStoredAuthorizationHeader &&
                      !isAuthorizationHeaderCleared &&
                      !isReadonly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onChange('');
                            formConfig.setValue(
                              'shouldClearAuthorizationHeader',
                              true,
                              { shouldDirty: true },
                            );
                          }}
                        >{t`Clear`}</Button>
                      )}
                  </StyledAuthorizationRow>
                )}
              />
              {!isCreationMode && (
                <StyledAuthorizationStatus>
                  {hasStoredAuthorizationHeader && !isAuthorizationHeaderCleared
                    ? t`Authorization header: set`
                    : t`Authorization header: not set`}
                </StyledAuthorizationStatus>
              )}
            </StyledInputsContainer>
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Availability`}
              description={t`Disabled servers keep their settings but offer no tools to the AI chat.`}
            />
            <Controller
              name="isEnabled"
              control={formConfig.control}
              render={({ field: { onChange, value } }) => (
                <Card.Root fullWidth>
                  <SettingsOptionCardContentSwitch
                    title={t`Enabled`}
                    description={t`Offer this server's tools in the AI chat`}
                    checked={value}
                    onChange={onChange}
                    disabled={isReadonly}
                  />
                </Card.Root>
              )}
            />
          </Section.Root>
          {!isCreationMode && isDefined(mcpServer) && (
            <SettingsDevelopersMcpServerToolsSection
              mcpServer={mcpServer}
              isSyncing={isSyncingTools}
              onSync={handleSyncTools}
            />
          )}
          {!isCreationMode && !isReadonly && (
            <Section.Root>
              <Section.Header
                title={t`Danger zone`}
                description={t`Delete this MCP server`}
              />
              <Button
                startIcon={<IconTrash />}
                onClick={() => openDialog(DELETE_MCP_SERVER_MODAL_ID)}
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
          dialogId={DELETE_MCP_SERVER_MODAL_ID}
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
