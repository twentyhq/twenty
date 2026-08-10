import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH,
  CampaignEnvelopeBox,
} from '@/activities/emails/components/CampaignEnvelopeBox';
import { EmailComposerFieldRow } from '@/activities/emails/components/EmailComposerFieldRow';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
`;

type CampaignSentEnvelopeProps = {
  campaign: MessageCampaign;
  width: string;
};

// The sent counterpart of the draft envelope. It deliberately does not reuse
// CampaignDetailsFields: that component owns the draft persistence state, which
// has nothing to write for a campaign that has already gone out.
export const CampaignSentEnvelope = ({
  campaign,
  width,
}: CampaignSentEnvelopeProps) => {
  const { unsubscribeTopics } = useUnsubscribeTopics();

  const fromAddress = campaign.fromAddress?.primaryEmail;
  const subject = campaign.subject;

  const unsubscribeTopic = isDefined(campaign.unsubscribeTopicId)
    ? unsubscribeTopics.find(
        (topic) => topic.id === campaign.unsubscribeTopicId,
      )
    : undefined;

  return (
    <CampaignEnvelopeBox width={width}>
      <EmailComposerFieldRow
        label={t`From`}
        labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
      >
        {isNonEmptyString(fromAddress) ? (
          <StyledValue>{fromAddress}</StyledValue>
        ) : (
          <StyledEmptyValue>{t`No sender`}</StyledEmptyValue>
        )}
      </EmailComposerFieldRow>
      <EmailComposerFieldRow
        label={t`To`}
        labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
      >
        <FormSingleRecordPicker
          disabled
          objectNameSingulars={[CoreObjectNameSingular.MessageList]}
          defaultValue={campaign.listId}
          onChange={() => {}}
        />
      </EmailComposerFieldRow>
      {isDefined(unsubscribeTopic) && (
        <EmailComposerFieldRow
          label={t`Unsubscribe topic`}
          labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
        >
          <StyledValue>
            {unsubscribeTopic.name ?? t`Untitled topic`}
          </StyledValue>
        </EmailComposerFieldRow>
      )}
      <EmailComposerFieldRow
        label={t`Subject`}
        labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
      >
        {isNonEmptyString(subject) ? (
          <StyledValue>{subject}</StyledValue>
        ) : (
          <StyledEmptyValue>{t`No subject`}</StyledEmptyValue>
        )}
      </EmailComposerFieldRow>
    </CampaignEnvelopeBox>
  );
};
