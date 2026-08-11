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
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';

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
  const {
    unsubscribeTopics,
    loading: areTopicsLoading,
    error: topicsError,
  } = useUnsubscribeTopics();

  // Nothing on this surface is editable, so the list resolves to a plain chip
  // rather than a disabled picker: the picker draws a full-width input box,
  // which reads as "you may type here" next to two rows of static text.
  // withSoftDeleted keeps a list that was deleted after the send visible.
  const hasList = isDefined(campaign.listId) && isValidUuid(campaign.listId);

  const {
    record: list,
    loading: isListLoading,
    error: listError,
  } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: campaign.listId ?? '',
    withSoftDeleted: true,
    skip: !hasList,
  });

  // useFindOneRecord skips the query outright when the role cannot read the
  // object, which looks exactly like a lookup that came back empty: not
  // loading, no error, no record. Without this the row would tell a reader who
  // simply lacks access that the list was deleted.
  const { objectMetadataItem: messageListObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.MessageList,
    });

  const { canReadObjectRecords: canReadMessageLists } =
    useObjectPermissionsForObject(messageListObjectMetadataItem.id);

  const isListKnownDeleted =
    hasList &&
    canReadMessageLists &&
    !isDefined(list) &&
    !isListLoading &&
    !isDefined(listError);

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

  const isTopicKnownDeleted =
    hasUnsubscribeTopic &&
    !isDefined(unsubscribeTopic) &&
    !areTopicsLoading &&
    !isDefined(topicsError);

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
          // Same rule as the topic row below: a list is only called deleted
          // once the query came back empty of its own accord, never because it
          // is still in flight or failed.
          isListKnownDeleted && (
            <StyledEmptyValue>{t`Deleted list`}</StyledEmptyValue>
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
            // "Deleted" is a claim about the record, so it is only made once
            // the topics actually came back: neither a slow query nor a failed
            // one — a network error, or a role that cannot read topics — gets
            // to report a live topic as gone.
            isTopicKnownDeleted && (
              <StyledEmptyValue>{t`Deleted topic`}</StyledEmptyValue>
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
