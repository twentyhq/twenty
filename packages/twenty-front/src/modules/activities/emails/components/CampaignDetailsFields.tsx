import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import {
  CoreObjectNameSingular,
  MessageChannelType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH,
  CampaignEnvelopeBox,
} from '@/activities/emails/components/CampaignEnvelopeBox';
import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { useCampaignDetailsState } from '@/activities/emails/hooks/useCampaignDetailsState';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { Select } from '@/ui/input/components/Select';

const StyledSubjectInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  outline: none;
  padding: 0;
  width: 100%;
`;

const StyledWarning = styled.div`
  align-items: flex-start;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledWarningIcon = styled(IconAlertTriangle)`
  color: ${themeCssVariables.color.yellow};
  flex-shrink: 0;
`;

type CampaignDetailsFieldsProps = {
  campaign: MessageCampaign;
  width: string;
};

export const CampaignDetailsFields = ({
  campaign,
  width,
}: CampaignDetailsFieldsProps) => {
  const { theme } = useContext(ThemeContext);
  const detailsState = useCampaignDetailsState({ campaign });

  const { channels } = useMyMessageChannels();
  const { unsubscribeTopics } = useUnsubscribeTopics();
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
          <StyledWarning>
            <StyledWarningIcon size={theme.icon.size.sm} />
            {t`No sending address is available. Connect a verified sending domain in Settings before this campaign can go out.`}
          </StyledWarning>
        )
      }
    >
      <ComposerFieldRow
        label={t`From`}
        labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
      >
        <Select
          dropdownId="campaign-composer-from-account"
          fullWidth
          value={detailsState.fromAddress}
          options={senderOptions}
          emptyOption={{ label: t`Select a sender`, value: '' }}
          onChange={detailsState.setFromAddress}
        />
      </ComposerFieldRow>
      <ComposerFieldRow
        label={t`To`}
        labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
      >
        <FormSingleRecordPicker
          key={`list-${detailsState.draftResyncKey}`}
          objectNameSingulars={[CoreObjectNameSingular.MessageList]}
          defaultValue={detailsState.listId}
          onChange={detailsState.setListId}
          onCreate={handleCreateList}
        />
      </ComposerFieldRow>
      {hasTopicOptions && (
        <ComposerFieldRow
          label={t`Unsubscribe topic`}
          labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
        >
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
        </ComposerFieldRow>
      )}
      <ComposerFieldRow
        label={t`Subject`}
        labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
      >
        <StyledSubjectInput
          key={`subject-${detailsState.draftResyncKey}`}
          type="text"
          aria-label={t`Subject`}
          defaultValue={detailsState.subject}
          onChange={(event) => detailsState.setSubject(event.target.value)}
        />
      </ComposerFieldRow>
    </CampaignEnvelopeBox>
  );
};
