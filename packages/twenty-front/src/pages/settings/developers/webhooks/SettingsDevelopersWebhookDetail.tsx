import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconSettings, IconTrash } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsDevelopersWebhooksDetail = () => {
  const [isDeleteWebhookModalOpen, setIsDeleteWebhookModalOpen] =
    useState(false);
  const navigate = useNavigate();
  const { webhookId = '' } = useParams();
  const { record: webhookData } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
    objectRecordId: webhookId,
  });
  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });
  const deleteWebhook = () => {
    deleteOneWebhook(webhookId);
    navigate('/settings/developers');
  };
  return (
    <>
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
                title="Danger zone"
                description="Delete this integration"
              />
              <Button
                accent="danger"
                variant="secondary"
                title="Disable"
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
    </>
  );
};
