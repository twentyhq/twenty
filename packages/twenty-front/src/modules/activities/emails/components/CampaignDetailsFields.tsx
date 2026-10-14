import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  CoreObjectNameSingular,
  MessageChannelType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  CampaignEnvelopeBox,
  CampaignEnvelopeRow,
} from '@/activities/emails/components/CampaignEnvelopeBox';
import { useCampaignDetailsState } from '@/activities/emails/hooks/useCampaignDetailsState';
import { useCampaignEmailEditorVariables } from '@/activities/emails/hooks/useCampaignEmailEditorVariables';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { Select } from '@/ui/input/components/Select';
import { TemplateVariableListPicker } from '@/ui/input/components/TemplateVariableListPicker';
import { TemplateVariableListPickerContext } from '@/ui/input/contexts/TemplateVariableListPickerContext';

const StyledWarningContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

type CampaignDetailsFieldsProps = {
  campaign: MessageCampaign;
  width: string;
};

export const CampaignDetailsFields = ({
  campaign,
  width,
}: CampaignDetailsFieldsProps) => {
  const detailsState = useCampaignDetailsState({ campaign });
  const { channels } = useMyMessageChannels();
  const { unsubscribeTopics } = useUnsubscribeTopics();
  const { variables, formatTemplateVariableWithExistingFallback } =
    useCampaignEmailEditorVariables();
  const { createOneRecord: createMessageList } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
  });

  const handleCreateList = async (searchInput?: string) => {
    const listName = searchInput?.trim() ?? '';
    const createdList = await createMessageList({
      name: listName.length > 0 ? listName : t`Untitled list`,
    });

    if (isDefined(createdList)) {
      detailsState.setListId(createdList.id);
    }
  };

  const senderOptions: SelectOption<string>[] = channels
    .filter((channel) => channel.type === MessageChannelType.EMAIL_GROUP)
    .map((channel) => channel.connectedAccount?.handle)
    .filter(isDefined)
    .map((handle) => ({ label: handle, value: handle }));

  const topicOptions: SelectOption<string>[] = unsubscribeTopics.map(
    (topic) => ({
      label: topic.name ?? t`Untitled topic`,
      value: topic.id,
    }),
  );

  const hasTopicOptions = topicOptions.length > 0;
  const hasSenderOptions = senderOptions.length > 0;

  return (
    <CampaignEnvelopeBox
      width={width}
      onBlur={() => detailsState.flush()}
      below={
        !hasSenderOptions && (
          <StyledWarningContainer>
            <InlineBanner
              embedded
              status="error"
              icon={<IconAlertTriangle aria-hidden="true" />}
            >{t`No sending address. Connect a verified domain in Settings.`}</InlineBanner>
          </StyledWarningContainer>
        )
      }
    >
      <CampaignEnvelopeRow label={t`From`}>
        <Select
          dropdownId="campaign-composer-from-account"
          fullWidth
          value={detailsState.fromAddress}
          options={senderOptions}
          emptyOption={{ label: t`Select a sender`, value: '' }}
          onChange={detailsState.setFromAddress}
        />
      </CampaignEnvelopeRow>
      <CampaignEnvelopeRow label={t`To`}>
        <FormSingleRecordPicker
          key={`list-${detailsState.draftResyncKey}`}
          objectNameSingulars={[CoreObjectNameSingular.MessageList]}
          defaultValue={detailsState.listId}
          onChange={detailsState.setListId}
          onCreate={handleCreateList}
        />
      </CampaignEnvelopeRow>
      {hasTopicOptions && (
        <CampaignEnvelopeRow label={t`Unsubscribe topic`}>
          <Select
            dropdownId="campaign-composer-unsubscribe-topic"
            fullWidth
            value={detailsState.unsubscribeTopicId ?? ''}
            options={topicOptions}
            emptyOption={{ label: t`No topic`, value: '' }}
            onChange={(value) =>
              detailsState.setUnsubscribeTopicId(value === '' ? null : value)
            }
          />
        </CampaignEnvelopeRow>
      )}
      <CampaignEnvelopeRow label={t`Subject`}>
        <TemplateVariableListPickerContext.Provider
          value={{
            variables,
            formatTemplateVariable: formatTemplateVariableWithExistingFallback,
          }}
        >
          <FormTextFieldInput
            key={`subject-${detailsState.draftResyncKey}`}
            ariaLabel={t`Subject`}
            placeholder={t`Enter email subject`}
            defaultValue={detailsState.subject}
            onChange={detailsState.setSubject}
            VariablePicker={TemplateVariableListPicker}
            enableTemplateVariableFallback
          />
        </TemplateVariableListPickerContext.Provider>
      </CampaignEnvelopeRow>
    </CampaignEnvelopeBox>
  );
};
