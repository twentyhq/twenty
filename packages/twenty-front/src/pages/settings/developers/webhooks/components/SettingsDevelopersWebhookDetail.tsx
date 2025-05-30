import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useWebhookUpdateForm } from '@/settings/developers/hooks/useWebhookUpdateForm';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconBox,
  IconNorthStar,
  IconPlus,
  IconRefresh,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';
import { Button, IconButton, SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
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

const DELETE_WEBHOOK_MODAL_ID = 'delete-webhook-modal';

export const SettingsDevelopersWebhooksDetail = () => {
  const { t } = useLingui();

  const { objectMetadataItems } = useObjectMetadataItems();

  const isMobile = useIsMobile();

  const { getIcon } = useIcons();

  const { webhookId = '' } = useParams();

  const [searchParams] = useSearchParams();

  const isCreationMode = isDefined(searchParams.get('creationMode'));

  const {
    formData,
    title,
    loading,
    isTargetUrlValid,
    updateWebhook,
    updateOperation,
    removeOperation,
    deleteWebhook,
  } = useWebhookUpdateForm({
    webhookId,
    isCreationMode,
  });

  const { openModal } = useModal();

  const fieldTypeOptions: SelectOption<string>[] = useMemo(
    () => [
      { value: '*', label: t`All Objects`, Icon: IconNorthStar },
      ...objectMetadataItems.map((item) => ({
        value: item.nameSingular,
        label: item.labelPlural,
        Icon: getIcon(item.icon),
      })),
    ],
    [objectMetadataItems, getIcon, t],
  );

  const actionOptions: SelectOption<string>[] = [
    { value: '*', label: t`All Actions`, Icon: IconNorthStar },
    { value: 'created', label: t`Created`, Icon: IconPlus },
    { value: 'updated', label: t`Updated`, Icon: IconRefresh },
    { value: 'deleted', label: t`Deleted`, Icon: IconTrash },
  ];

  if (loading || !formData) {
    return <SettingsSkeletonLoader />;
  }

  const confirmationText = t`yes`;

  return (
    <SubMenuTopBarContainer
      title={title}
      reserveTitleSpace
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Webhooks`,
          href: getSettingsPath(SettingsPath.Webhooks),
        },
        { children: title },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Endpoint URL`}
            description={t`We will send POST requests to this endpoint for every new event`}
          />
          <TextInput
            placeholder={t`URL`}
            value={formData.targetUrl}
            onChange={(targetUrl) => {
              updateWebhook({ targetUrl });
            }}
            error={!isTargetUrlValid ? t`Please enter a valid URL` : undefined}
            fullWidth
            autoFocus={formData.targetUrl.trim() === ''}
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
            value={formData.description}
            onChange={(description) => {
              updateWebhook({ description });
            }}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Filters`}
            description={t`Select the events you wish to send to this endpoint`}
          />
          {formData.operations.map((operation, index) => (
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

              {index < formData.operations.length - 1 ? (
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
            title={t`Secret`}
            description={t`Optional: Define a secret string that we will include in every webhook. Use this to authenticate and verify the webhook upon receipt.`}
          />
          <TextInput
            type="password"
            placeholder={t`Write a secret`}
            value={formData.secret}
            onChange={(secret: string) => {
              updateWebhook({ secret: secret.trim() });
            }}
            fullWidth
          />
        </Section>
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
            onClick={() => openModal(DELETE_WEBHOOK_MODAL_ID)}
          />
          <ConfirmationModal
            confirmationPlaceholder={confirmationText}
            confirmationValue={confirmationText}
            modalId={DELETE_WEBHOOK_MODAL_ID}
            title={t`Delete webhook`}
            subtitle={
              <Trans>
                Please type {confirmationText} to confirm you want to delete
                this webhook.
              </Trans>
            }
            onConfirmClick={deleteWebhook}
            confirmButtonText={t`Delete webhook`}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
