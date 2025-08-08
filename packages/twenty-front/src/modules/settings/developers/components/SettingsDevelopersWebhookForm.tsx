import { Controller, FormProvider } from 'react-hook-form';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { useWebhookForm } from '@/settings/developers/hooks/useWebhookForm';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  getUrlHostnameOrThrow,
  isDefined,
  isValidUrl,
} from 'twenty-shared/utils';
import {
  H2Title,
  IconBox,
  IconNorthStar,
  IconPlus,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';
import { Button, IconButton, SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
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
  const { objectMetadataItems } = useObjectMetadataItems();
  const isMobile = useIsMobile();
  const { getIcon } = useIcons();
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
      return 'New Webhook';
    }

    const targetUrl = formConfig.watch('targetUrl');
    if (isDefined(targetUrl) && isValidUrl(targetUrl.trim())) {
      return getUrlHostnameOrThrow(targetUrl);
    }
  };

  if ((loading && !isCreationMode) || isDefined(error)) {
    return <SettingsSkeletonLoader />;
  }

  const objectOptions: SelectOption<string>[] = [
    { label: 'All Objects', value: '*', Icon: IconNorthStar },
    ...objectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    })),
  ];

  const actionOptions: SelectOption<string>[] = [
    { label: 'All', value: '*', Icon: IconNorthStar },
    { label: 'Created', value: 'created', Icon: IconPlus },
    { label: 'Updated', value: 'updated', Icon: IconBox },
    { label: 'Deleted', value: 'deleted', Icon: IconTrash },
  ];

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
            children: t`Webhooks`,
            href: getSettingsPath(SettingsPath.Webhooks),
          },
          { children: isCreationMode ? t`New` : getTitle() },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={formConfig.formState.isSubmitting}
            onCancel={() => navigate(SettingsPath.Webhooks)}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`Endpoint URL`}
              description={t`We will send POST requests to this endpoint for every new event`}
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
              description={t`An optional description`}
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
                <>
                  {value.map((operation, index) => (
                    <StyledFilterRow key={index} isMobile={isMobile}>
                      <Select
                        dropdownId={`object-webhook-type-select-${index}`}
                        value={operation.object}
                        options={objectOptions}
                        onChange={(newValue) =>
                          updateOperation(index, 'object', newValue)
                        }
                        fullWidth
                        emptyOption={{ label: 'Object', value: null }}
                      />
                      <Select
                        dropdownId={`operation-webhook-type-select-${index}`}
                        value={operation.action}
                        options={actionOptions}
                        onChange={(newValue) =>
                          updateOperation(index, 'action', newValue)
                        }
                        fullWidth
                      />
                      {isDefined(operation.object) ? (
                        <IconButton
                          Icon={IconTrash}
                          variant="tertiary"
                          size="medium"
                          onClick={() => removeOperation(index)}
                        />
                      ) : (
                        <StyledPlaceholder />
                      )}
                    </StyledFilterRow>
                  ))}
                </>
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
