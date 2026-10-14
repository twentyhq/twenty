import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { Controller, FormProvider } from 'react-hook-form';

import { LogConsoleDetailPanelLayout } from '@/log-console/components/LogConsoleDetailPanelLayout';
import { logConsoleWebhooksViewState } from '@/log-console/states/logConsoleWebhooksViewState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { useWebhookForm } from '@/settings/developers/hooks/useWebhookForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  getUrlHostnameOrThrow,
  isDefined,
  isValidUrl,
} from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconTrash, IconWebhook } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { Button } from 'twenty-ui/primitives/input';
import { SettingsDatabaseEventsForm } from '@/settings/components/SettingsDatabaseEventsForm';

const DELETE_WEBHOOK_MODAL_ID = 'delete-webhook-modal';

type LogConsoleWebhookFormProps = {
  webhookId?: string;
};

export const LogConsoleWebhookForm = ({
  webhookId,
}: LogConsoleWebhookFormProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const setLogConsoleWebhooksView = useSetAtomState(
    logConsoleWebhooksViewState,
  );
  const { openDialog } = useDialog();

  const goBackToList = () => setLogConsoleWebhooksView({ type: 'list' });

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
  } = useWebhookForm({
    webhookId,
    mode: isDefined(webhookId) ? WebhookFormMode.Edit : WebhookFormMode.Create,
    onCreated: (createdWebhookId) =>
      setLogConsoleWebhooksView({ type: 'detail', id: createdWebhookId }),
    onDeleted: goBackToList,
  });

  const getTitle = () => {
    if (isCreationMode) {
      return t`New webhook`;
    }

    const targetUrl = formConfig.watch('targetUrl');
    if (isDefined(targetUrl) && isValidUrl(targetUrl.trim())) {
      return getUrlHostnameOrThrow(targetUrl);
    }

    return t`Webhook`;
  };

  const webhookIcon = (
    <IconWebhook size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
  );

  if ((loading && !isCreationMode) || isDefined(error)) {
    return (
      <LogConsoleDetailPanelLayout
        title={getTitle()}
        icon={webhookIcon}
        onClose={goBackToList}
      >
        <ToastOnQueryErrorEffect
          error={error}
          message={t`Failed to load webhook`}
        />
        {isDefined(error) ? (
          <SettingsEmptyPlaceholder>{t`Failed to load webhook`}</SettingsEmptyPlaceholder>
        ) : (
          <SettingsSkeletonLoader />
        )}
      </LogConsoleDetailPanelLayout>
    );
  }

  const descriptionTextAreaId = `${webhookId}-description`;
  const targetUrlTextInputId = `${webhookId}-target-url`;
  const secretTextInputId = `${webhookId}-secret`;

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <LogConsoleDetailPanelLayout
        title={getTitle()}
        icon={webhookIcon}
        onClose={goBackToList}
        actions={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={formConfig.formState.isSubmitting}
            onCancel={goBackToList}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <Section.Root>
          <Section.Header
            title={t`Endpoint URL`}
            description={t`We will send a POST request to this endpoint for each new event in application/json format`}
          />
          <Controller
            name="targetUrl"
            control={formConfig.control}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
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
      </LogConsoleDetailPanelLayout>
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
