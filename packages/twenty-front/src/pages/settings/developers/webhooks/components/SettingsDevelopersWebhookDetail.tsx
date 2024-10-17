import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconPlus, IconTrash } from 'twenty-ui';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { SettingsDeveloppersWebhookUsageGraph } from '@/settings/developers/webhook/components/SettingsDevelopersWebhookUsageGraph';
import { SettingsDevelopersWebhookUsageGraphEffect } from '@/settings/developers/webhook/components/SettingsDevelopersWebhookUsageGraphEffect';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const StyledFilterRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledAddOperationButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDevelopersWebhooksDetail = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const navigate = useNavigate();
  const { webhookId = '' } = useParams();

  const [isDeleteWebhookModalOpen, setIsDeleteWebhookModalOpen] =
    useState(false);
  const [description, setDescription] = useState<string>('');
  const [operations, setOperations] = useState<
    Array<{ object: string; action: string }>
  >([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const { record: webhookData } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
    objectRecordId: webhookId,
    onCompleted: (data) => {
      setDescription(data?.description ?? '');
      setOperations(
        data?.operations.map((op: string) => {
          const [object, action] = op.split('.');
          return { object, action };
        }) ?? [],
      );
      setIsDirty(false);
    },
  });

  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const developerPath = getSettingsPagePath(SettingsPath.Developers);

  const deleteWebhook = () => {
    deleteOneWebhook(webhookId);
    navigate(developerPath);
  };

  const isAnalyticsV2Enabled = useIsFeatureEnabled('IS_ANALYTICS_V2_ENABLED');

  const fieldTypeOptions = [
    { value: '*', label: 'All Objects' },
    ...objectMetadataItems.map((item) => ({
      value: item.nameSingular,
      label: item.labelSingular,
    })),
  ];

  const { updateOneRecord } = useUpdateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const handleSave = async () => {
    setIsDirty(false);
    await updateOneRecord({
      idToUpdate: webhookId,
      updateOneRecordInput: {
        operations: operations.map((op) => `${op.object}.${op.action}`),
        description: description,
      },
    });
    navigate(developerPath);
  };

  const addOperation = () => {
    setOperations([...operations, { object: '*', action: '*' }]);
    setIsDirty(true);
  };

  const updateOperation = (
    index: number,
    field: 'object' | 'action',
    value: string,
  ) => {
    const newOperations = [...operations];
    newOperations[index][field] = value;
    setOperations(newOperations);
    setIsDirty(true);
  };

  const removeOperation = (index: number) => {
    const newOperations = operations.filter((_, i) => i !== index);
    setOperations(newOperations);
    setIsDirty(true);
  };

  if (!webhookData?.targetUrl) {
    return <></>;
  }

  return (
    <SubMenuTopBarContainer
      title={webhookData.targetUrl}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Developers', href: developerPath },
        { children: 'Webhook' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!isDirty}
          onCancel={() => {
            navigate(developerPath);
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
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
          <H2Title title="Description" description="An optional description" />
          <TextArea
            placeholder="Write a description"
            minRows={4}
            value={description}
            onChange={(description) => {
              setDescription(description);
              setIsDirty(true);
            }}
          />
        </Section>
        <Section>
          <H2Title
            title="Filters"
            description="Select the events you wish to send to this endpoint"
          />
          {operations.map((operation, index) => (
            <StyledFilterRow key={index}>
              <Select
                fullWidth
                dropdownId={`object-webhook-type-select-${index}`}
                value={operation.object}
                onChange={(object) => updateOperation(index, 'object', object)}
                options={fieldTypeOptions}
              />
              <Select
                fullWidth
                dropdownId={`operation-webhook-type-select-${index}`}
                value={operation.action}
                onChange={(action) => updateOperation(index, 'action', action)}
                options={[
                  { value: '*', label: 'All Actions' },
                  { value: 'create', label: 'Create' },
                  { value: 'update', label: 'Update' },
                  { value: 'delete', label: 'Delete' },
                ]}
              />

              <IconButton
                onClick={() => removeOperation(index)}
                variant="tertiary"
                size="medium"
                Icon={IconTrash}
              />
            </StyledFilterRow>
          ))}
          <StyledAddOperationButton
            variant="tertiary"
            title="Add Operation"
            Icon={IconPlus}
            onClick={addOperation}
          />
        </Section>
        {isAnalyticsV2Enabled && (
          <>
            <SettingsDevelopersWebhookUsageGraphEffect webhookId={webhookId} />
            <SettingsDeveloppersWebhookUsageGraph />
          </>
        )}
        <Section>
          <H2Title title="Danger zone" description="Delete this integration" />
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
              <>Please type "yes" to confirm you want to delete this webhook.</>
            }
            onConfirmClick={deleteWebhook}
            deleteButtonText="Delete webhook"
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
