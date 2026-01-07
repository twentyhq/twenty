import { Controller, FormProvider } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { type WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { useWebhookForm } from '@/settings/developers/hooks/useWebhookForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  getUrlHostnameOrThrow,
  isDefined,
  isValidUrl,
} from 'twenty-shared/utils';
import { H2Title, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
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
  const { openModal } = useModal();
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
    return <SettingsSkeletonLoader />;
  }

  const descriptionTextAreaId = `${webhookId}-description`;
  const targetUrlTextInputId = `${webhookId}-target-url`;
  const secretTextInputId = `${webhookId}-secret`;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer
        title={getTitle()}
        reserveTitleSpace
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`APIs & Webhooks`,
            href: getSettingsPath(SettingsPath.ApiWebhooks),
          },
          { children: isCreationMode ? t`New` : getTitle() },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={formConfig.formState.isSubmitting}
            onCancel={() => navigate(SettingsPath.ApiWebhooks)}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
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
          </Section>
          <Section>
            <H2Title
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
                  value={value || ''}
                  onChange={onChange}
                />
              )}
            />
          </Section>
          <Section>
            <H2Title
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
          </Section>
          <Section>
            <H2Title
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
          </Section>
          {!isCreationMode && (
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this webhook`}
              />
              <Button
                accent="danger"
                variant="secondary"
                title={t`Delete`}
                Icon={IconTrash}
                onClick={() => openModal(DELETE_WEBHOOK_MODAL_ID)}
              />
            </Section>
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
      {!isCreationMode && (
        <ConfirmationModal
          confirmationPlaceholder={t`yes`}
          confirmationValue={t`yes`}
          modalId={DELETE_WEBHOOK_MODAL_ID}
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
