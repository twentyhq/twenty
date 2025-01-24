import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  H2Title,
  IconBox,
  IconButton,
  IconNorthStar,
  IconPlus,
  IconRefresh,
  IconTrash,
  isDefined,
  Section,
  useIcons,
} from 'twenty-ui';

import { AnalyticsActivityGraph } from '@/analytics/components/AnalyticsActivityGraph';
import { AnalyticsGraphEffect } from '@/analytics/components/AnalyticsGraphEffect';
import { AnalyticsGraphDataInstanceContext } from '@/analytics/states/contexts/AnalyticsGraphDataInstanceContext';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { SettingsPath } from '@/types/SettingsPath';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const OBJECT_DROPDOWN_WIDTH = 340;
const ACTION_DROPDOWN_WIDTH = 140;
const OBJECT_MOBILE_WIDTH = 150;
const ACTION_MOBILE_WIDTH = 140;

const StyledFilterRow = styled.div<{ isMobile: boolean }>`
  display: grid;
  grid-template-columns: ${({ isMobile }) =>
    isMobile
      ? `${OBJECT_MOBILE_WIDTH}px ${ACTION_MOBILE_WIDTH}px auto`
      : `${OBJECT_DROPDOWN_WIDTH}px ${ACTION_DROPDOWN_WIDTH}px auto`};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  align-items: center;
`;

const StyledPlaceholder = styled.div`
  height: ${({ theme }) => theme.spacing(8)};
  width: ${({ theme }) => theme.spacing(8)};
`;

export const SettingsDevelopersWebhooksDetail = () => {
  const { t } = useLingui();

  const { objectMetadataItems } = useObjectMetadataItems();
  const isAnalyticsEnabled = useRecoilValue(isAnalyticsEnabledState);
  const isMobile = useIsMobile();
  const navigate = useNavigateSettings();
  const { webhookId = '' } = useParams();

  const [isDeleteWebhookModalOpen, setIsDeleteWebhookModalOpen] =
    useState(false);
  const [description, setDescription] = useState<string>('');
  const [operations, setOperations] = useState<WebhookOperationType[]>([
    WEBHOOK_EMPTY_OPERATION,
  ]);
  const [secret, setSecret] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const { getIcon } = useIcons();

  const { record: webhookData } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
    objectRecordId: webhookId,
    onCompleted: (data) => {
      setDescription(data?.description ?? '');
      const baseOperations = data?.operations
        ? data.operations.map((op: string) => {
            const [object, action] = op.split('.');
            return { object, action };
          })
        : data?.operation
          ? [
              {
                object: data.operation.split('.')[0],
                action: data.operation.split('.')[1],
              },
            ]
          : [];

      setOperations(addEmptyOperationIfNecessary(baseOperations));
      setSecret(data?.secret ?? '');
      setIsDirty(false);
    },
  });

  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const deleteWebhook = () => {
    deleteOneWebhook(webhookId);
    navigate(SettingsPath.Developers);
  };

  const isAnalyticsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsAnalyticsV2Enabled,
  );

  const fieldTypeOptions: SelectOption<string>[] = useMemo(
    () => [
      { value: '*', label: 'All Objects', Icon: IconNorthStar },
      ...objectMetadataItems.map((item) => ({
        value: item.nameSingular,
        label: item.labelPlural,
        Icon: getIcon(item.icon),
      })),
    ],
    [objectMetadataItems, getIcon],
  );

  const actionOptions: SelectOption<string>[] = [
    { value: '*', label: 'All Actions', Icon: IconNorthStar },
    { value: 'created', label: 'Created', Icon: IconPlus },
    { value: 'updated', label: 'Updated', Icon: IconRefresh },
    { value: 'deleted', label: 'Deleted', Icon: IconTrash },
  ];

  const { updateOneRecord } = useUpdateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const cleanAndFormatOperations = (operations: WebhookOperationType[]) => {
    return Array.from(
      new Set(
        operations
          .filter((op) => isDefined(op.object) && isDefined(op.action))
          .map((op) => `${op.object}.${op.action}`),
      ),
    );
  };

  const handleSave = async () => {
    const cleanedOperations = cleanAndFormatOperations(operations);
    setIsDirty(false);
    await updateOneRecord({
      idToUpdate: webhookId,
      updateOneRecordInput: {
        operations: cleanedOperations,
        description: description,
        secret: secret,
      },
    });
    navigate(SettingsPath.Developers);
  };

  const addEmptyOperationIfNecessary = (
    newOperations: WebhookOperationType[],
  ) => {
    if (
      !newOperations.some((op) => op.object === '*' && op.action === '*') &&
      !newOperations.some((op) => op.object === null)
    ) {
      return [...newOperations, WEBHOOK_EMPTY_OPERATION];
    }
    return newOperations;
  };

  const updateOperation = (
    index: number,
    field: 'object' | 'action',
    value: string | null,
  ) => {
    const newOperations = [...operations];

    newOperations[index] = {
      ...newOperations[index],
      [field]: value,
    };

    setOperations(addEmptyOperationIfNecessary(newOperations));
    setIsDirty(true);
  };

  const removeOperation = (index: number) => {
    const newOperations = operations.filter((_, i) => i !== index);
    setOperations(addEmptyOperationIfNecessary(newOperations));
    setIsDirty(true);
  };

  if (!webhookData?.targetUrl) {
    return <></>;
  }

  const confirmationText = t`yes`;

  return (
    <SubMenuTopBarContainer
      title={webhookData.targetUrl}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Developers`,
          href: getSettingsPath(SettingsPath.Developers),
        },
        { children: t`Webhook` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!isDirty}
          onCancel={() => {
            navigate(SettingsPath.Developers);
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Endpoint URL`}
            description={t`We will send POST requests to this endpoint for every new event`}
          />
          <TextInput
            placeholder={t`URL`}
            value={webhookData.targetUrl}
            disabled
            fullWidth
          />
        </Section>
        <Section>
          <H2Title
            title={t`Description`}
            description={t`An optional description`}
          />
          <TextArea
            placeholder={t`Write a description`}
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
            title={t`Filters`}
            description={t`Select the events you wish to send to this endpoint`}
          />
          {operations.map((operation, index) => (
            <StyledFilterRow isMobile={isMobile} key={index}>
              <Select
                withSearchInput
                dropdownWidth={
                  isMobile ? OBJECT_MOBILE_WIDTH : OBJECT_DROPDOWN_WIDTH
                }
                dropdownId={`object-webhook-type-select-${index}`}
                value={operation.object}
                onChange={(object) => updateOperation(index, 'object', object)}
                options={fieldTypeOptions}
                emptyOption={{
                  value: null,
                  label: t`Choose an object`,
                  Icon: IconBox,
                }}
              />

              <Select
                dropdownWidth={
                  isMobile ? ACTION_MOBILE_WIDTH : ACTION_DROPDOWN_WIDTH
                }
                dropdownId={`operation-webhook-type-select-${index}`}
                value={operation.action}
                onChange={(action) => updateOperation(index, 'action', action)}
                options={actionOptions}
              />

              {index < operations.length - 1 ? (
                <IconButton
                  onClick={() => removeOperation(index)}
                  variant="tertiary"
                  size="medium"
                  Icon={IconTrash}
                />
              ) : (
                <StyledPlaceholder />
              )}
            </StyledFilterRow>
          ))}
        </Section>
        <Section>
          <H2Title
            title="Secret"
            description="Optional: Define a secret string that we will include in every webhook. Use this to authenticate and verify the webhook upon receipt."
          />
          <TextInput
            type="password"
            placeholder="Write a secret"
            value={secret}
            onChange={(secret: string) => {
              setSecret(secret.trim());
              setIsDirty(true);
            }}
            fullWidth
          />
        </Section>
        {isAnalyticsEnabled && isAnalyticsV2Enabled && (
          <AnalyticsGraphDataInstanceContext.Provider
            value={{ instanceId: `webhook-${webhookId}-analytics` }}
          >
            <AnalyticsGraphEffect
              recordId={webhookId}
              endpointName="getWebhookAnalytics"
            />
            <AnalyticsActivityGraph
              recordId={webhookId}
              endpointName="getWebhookAnalytics"
            />
          </AnalyticsGraphDataInstanceContext.Provider>
        )}
        <Section>
          <H2Title
            title={t`Danger zone`}
            description={t`Delete this integration`}
          />
          <Button
            accent="danger"
            variant="secondary"
            title={t`Delete`}
            Icon={IconTrash}
            onClick={() => setIsDeleteWebhookModalOpen(true)}
          />
          <ConfirmationModal
            confirmationPlaceholder={confirmationText}
            confirmationValue={confirmationText}
            isOpen={isDeleteWebhookModalOpen}
            setIsOpen={setIsDeleteWebhookModalOpen}
            title={t`Delete webhook`}
            subtitle={
              <Trans>
                Please type {confirmationText} to confirm you want to delete
                this webhook.
              </Trans>
            }
            onConfirmClick={deleteWebhook}
            deleteButtonText={t`Delete webhook`}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
