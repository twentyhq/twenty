import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { Controller, FormProvider } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { type WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { useWebhookForm } from '@/settings/developers/hooks/useWebhookForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  getUrlHostnameOrThrow,
  isDefined,
  isValidUrl,
} from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SETTINGS_API_WEBHOOKS_TABS } from '~/pages/settings/api-webhooks/constants/SettingsApiWebhooksTabs';
import { SettingsDatabaseEventsForm } from '@/settings/components/SettingsDatabaseEventsForm';

const DELETE_WEBHOOK_MODAL_ID = 'delete-webhook-modal';

type SettingsDevelopersWebhookFormProps = {
  webhookId?: string;
  mode: WebhookFormMode;
};

export const SettingsDevelopersWebhookForm = ({
  webhookId,
  mode,
}: SettingsDevelopersWebhookFormProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { openDialog } = useDialog();
  const {
    formConfig,
    loading,
    canSave,
    handleSave,
    updateOperation,
    removeOperation,
    handleDelete,
    isCreationMode,
    error,
  } = useWebhookForm({ webhookId, mode });

  const getTitle = () => {
    if (isCreationMode) {
      return t`New Webhook`;
    }

    const targetUrl = formConfig.watch('targetUrl');
    if (isDefined(targetUrl) && isValidUrl(targetUrl.trim())) {
      return getUrlHostnameOrThrow(targetUrl);
    }
  };

  if ((loading && !isCreationMode) || isDefined(error)) {
    return (
      <>
        <ToastOnQueryErrorEffect
          error={error}
          message={t`Failed to load webhook`}
        />
        <SettingsSkeletonLoader />
      </>
    );
  }

  const descriptionTextAreaId = `${webhookId}-description`;
  const targetUrlTextInputId = `${webhookId}-target-url`;
  const secretTextInputId = `${webhookId}-secret`;

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsPageLayout
        title={getTitle()}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          {
            children: t`MCP & APIs`,
            href: getSettingsPath(
              SettingsPath.ApiWebhooks,
              undefined,
              undefined,
              SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.WEBHOOKS,
            ),
          },
          { children: isCreationMode ? t`New` : getTitle() },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={formConfig.formState.isSubmitting}
            onCancel={() =>
              navigate(
                SettingsPath.ApiWebhooks,
                undefined,
                undefined,
                undefined,
                SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.WEBHOOKS,
              )
            }
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section.Root>
            <Section.Header
              title={t`Endpoint URL`}
              description={t`We will send a POST request to this endpoint for each new event in application/json format`}
            />
            <Controller
              name="targetUrl"
              control={formConfig.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <SettingsTextInput
                    instanceId={targetUrlTextInputId}
                    placeholder={t`https://example.com/webhook`}
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    fullWidth
                    autoFocus={isCreationMode}
                  />
                );
              }}
            />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Description`}
              description={t`We will send a POST request to this endpoint for each new event in application/json format.`}
            />
            <Controller
              name="description"
              control={formConfig.control}
              render={({ field: { onChange, value } }) => (
                <TextArea
                  textAreaId={descriptionTextAreaId}
                  placeholder={t`Write a description`}
                  minRows={4}
                  maxRows={5}
                  value={value || ''}
                  onChange={onChange}
                />
              )}
            />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Filters`}
              description={t`Select the events you wish to send to this endpoint`}
            />
            <Controller
              name="operations"
              control={formConfig.control}
              render={({ field: { value } }) => (
                <SettingsDatabaseEventsForm
                  events={value}
                  updateOperation={updateOperation}
                  removeOperation={removeOperation}
                />
              )}
            />
          </Section.Root>
          <Section.Root>
            <Section.Header
              title={t`Secret`}
              description={t`Optional secret used to compute the HMAC signature for webhook payloads`}
            />
            <Controller
              name="secret"
              control={formConfig.control}
              render={({ field: { onChange, value } }) => (
                <SettingsTextInput
                  instanceId={secretTextInputId}
                  placeholder={t`Secret (optional)`}
                  value={value || ''}
                  onChange={onChange}
                  fullWidth
                />
              )}
            />
          </Section.Root>
          {!isCreationMode && (
            <Section.Root>
              <Section.Header
                title={t`Danger zone`}
                description={t`Delete this webhook`}
              />
              <Button
                startIcon={<IconTrash />}
                onClick={() => openDialog(DELETE_WEBHOOK_MODAL_ID)}
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
          dialogId={DELETE_WEBHOOK_MODAL_ID}
          title={t`Delete webhook`}
          subtitle={
            <Trans>
              Please type "yes" to confirm you want to delete this webhook.
            </Trans>
          }
          onConfirmClick={handleDelete}
          confirmButtonText={t`Delete`}
        />
      )}
    </FormProvider>
  );
};
