import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH,
  CampaignEnvelopeBox,
} from '@/activities/emails/components/CampaignEnvelopeBox';
import { EmailComposerFieldRow } from '@/activities/emails/components/EmailComposerFieldRow';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

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
  const { unsubscribeTopics, loading: areTopicsLoading } =
    useUnsubscribeTopics();

  // withSoftDeleted so a list deleted after the send still names what the
  // campaign went to.
  const hasList = isDefined(campaign.listId) && isValidUuid(campaign.listId);

  const { record: list, loading: isListLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: campaign.listId ?? '',
    withSoftDeleted: true,
    skip: !hasList,
  });

  // A lookup that returns nothing does not tell us why: the list may be
  // deleted, hidden by object or row-level permissions, or the query may have
  // failed — and useFindOneRecord skips entirely without read permission, which
  // is indistinguishable from an empty result. None of that is knowable here,
  // so the row reports what is true in every case instead of guessing at one.
  const isListUnresolved = hasList && !isDefined(list) && !isListLoading;

  const fromAddress = campaign.fromAddress?.primaryEmail;
  const subject = campaign.subject;

  // The row follows the id the campaign was sent with, not whether the topic
  // still exists: a topic deleted afterwards must not erase the fact that this
  // send was scoped to one.
  const hasUnsubscribeTopic = isDefined(campaign.unsubscribeTopicId);

  const unsubscribeTopic = hasUnsubscribeTopic
    ? unsubscribeTopics.find(
        (topic) => topic.id === campaign.unsubscribeTopicId,
      )
    : undefined;

  // Same rule as the list row: an id missing from the topics we can see may be
  // deleted or may simply be one this role cannot read, and the two look alike.
  const isTopicUnresolved =
    hasUnsubscribeTopic && !isDefined(unsubscribeTopic) && !areTopicsLoading;

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
        {isDefined(list) ? (
          <RecordChip
            record={list}
            objectNameSingular={CoreObjectNameSingular.MessageList}
          />
        ) : !hasList ? (
          <StyledEmptyValue>{t`No list`}</StyledEmptyValue>
        ) : (
          isListUnresolved && (
            <StyledEmptyValue>{t`Unavailable`}</StyledEmptyValue>
          )
        )}
      </EmailComposerFieldRow>
      {hasUnsubscribeTopic && (
        <EmailComposerFieldRow
          label={t`Unsubscribe topic`}
          labelMinWidth={CAMPAIGN_ENVELOPE_LABEL_MIN_WIDTH}
        >
          {isDefined(unsubscribeTopic) ? (
            <StyledValue>
              {unsubscribeTopic.name ?? t`Untitled topic`}
            </StyledValue>
          ) : (
            isTopicUnresolved && (
              <StyledEmptyValue>{t`Unavailable`}</StyledEmptyValue>
            )
          )}
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
