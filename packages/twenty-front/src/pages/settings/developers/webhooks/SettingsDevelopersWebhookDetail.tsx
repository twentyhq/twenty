import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconSettings, IconTrash } from 'twenty-ui';

type SettingsDevelopersWebhooksDetailForm = {
  description?: string;
};

export const SettingsDevelopersWebhooksDetail = () => {
  const [isDeleteWebhookModalOpen, setIsDeleteWebhookModalOpen] =
    useState(false);
  const navigate = useNavigate();
  const { webhookId = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const { record: webhookData } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
    objectRecordId: webhookId,
  });
  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });
  const deleteWebhook = () => {
    deleteOneWebhook(webhookId);
    navigate('/settings/developers');
  };
  const formConfig = useForm<SettingsDevelopersWebhooksDetailForm>();

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isDirty && isValid && !isSubmitting;

  const handleSave = async (
    formValues: SettingsDevelopersWebhooksDetailForm,
  ) => {
    try {
      await updateOneRecord({
        idToUpdate: webhookId,
        updateOneRecordInput: formValues,
      });
      navigate('/settings/developers');
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      {webhookData?.targetUrl && (
        <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
          <SettingsPageContainer>
            <SettingsHeaderContainer>
              <Breadcrumb
                links={[
                  { children: 'Developers', href: '/settings/developers' },
                  { children: 'Webhook' },
                ]}
              />
              <SaveAndCancelButtons
                onCancel={() => navigate(`/settings/developers`)}
                onSave={formConfig.handleSubmit(handleSave)}
                isSaveDisabled={!canSave}
              />
            </SettingsHeaderContainer>
            <Section>
              <H2Title
                title="Endpoint URL"
                description="We will send POST requests to this endpoint for every new event"
              />
              <TextInput
                placeholder="URL"
                value={webhookData.targetUrl}
                disabled
                fullWidth
              />
            </Section>
            <Section>
              <H2Title
                title="Description"
                description="An optional description"
              />
              <Controller
                name="description"
                control={formConfig.control}
                defaultValue={webhookData?.description ?? null}
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    placeholder="Write a description"
                    minRows={4}
                    value={value ?? undefined}
                    onChange={(nextValue) => onChange(nextValue ?? null)}
                  />
                )}
              />
            </Section>
            <Section>
              <H2Title
                title="Danger zone"
                description="Delete this integration"
              />
              <Button
                accent="danger"
                variant="secondary"
                title="Delete"
                Icon={IconTrash}
                onClick={() => setIsDeleteWebhookModalOpen(true)}
              />
              <ConfirmationModal
                confirmationPlaceholder="yes"
                confirmationValue="yes"
                isOpen={isDeleteWebhookModalOpen}
                setIsOpen={setIsDeleteWebhookModalOpen}
                title="Delete webhook"
                subtitle={
                  <>
                    Please type "yes" to confirm you want to delete this
                    webhook.
                  </>
                }
                onConfirmClick={deleteWebhook}
                deleteButtonText="Delete webhook"
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
    </FormProvider>
  );
};
