import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  CampaignEnvelopeBox,
  CampaignEnvelopeRow,
} from '@/activities/emails/components/CampaignEnvelopeBox';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { formatCampaignSendTime } from '@/activities/emails/utils/formatCampaignSendTime';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

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

// Doesn't reuse CampaignDetailsFields, which owns draft persistence state a sent campaign has no use for.
export const CampaignSentEnvelope = ({
  campaign,
  width,
}: CampaignSentEnvelopeProps) => {
  const { unsubscribeTopics, loading: areTopicsLoading } =
    useUnsubscribeTopics();
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const hasList = isDefined(campaign.listId) && isValidUuid(campaign.listId);

  const { record: list, loading: isListLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: campaign.listId ?? '',
    // A list deleted after the send must still name what the campaign went to.
    withSoftDeleted: true,
    skip: !hasList,
  });

  // An empty lookup can't tell deletion, permissions or failure apart, so report what's true in every case.
  const isListUnresolved = hasList && !isDefined(list) && !isListLoading;

  const fromAddress = campaign.fromAddress?.primaryEmail;
  const subject = campaign.subject;

  // Follows the sent id: a topic deleted afterwards must not erase that the send was scoped to one.
  const hasUnsubscribeTopic = isDefined(campaign.unsubscribeTopicId);

  const unsubscribeTopic = hasUnsubscribeTopic
    ? unsubscribeTopics.find(
        (topic) => topic.id === campaign.unsubscribeTopicId,
      )
    : undefined;

  // A missing topic may be deleted or unreadable by this role; the two look alike.
  const isTopicUnresolved =
    hasUnsubscribeTopic && !isDefined(unsubscribeTopic) && !areTopicsLoading;

  const scheduledSendTime =
    campaign.status === MessageCampaignStatus.SCHEDULED
      ? formatCampaignSendTime({
          value: campaign.scheduledAt,
          timeZone,
          dateFormat,
          timeFormat,
          localeCatalog,
        })
      : '';

  return (
    <CampaignEnvelopeBox width={width}>
      <CampaignEnvelopeRow label={t`From`}>
        {isNonEmptyString(fromAddress) ? (
          <StyledValue>{fromAddress}</StyledValue>
        ) : (
          <StyledEmptyValue>{t`No sender`}</StyledEmptyValue>
        )}
      </CampaignEnvelopeRow>
      <CampaignEnvelopeRow label={t`To`}>
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
      </CampaignEnvelopeRow>
      {hasUnsubscribeTopic && (
        <CampaignEnvelopeRow label={t`Unsubscribe topic`}>
          {isDefined(unsubscribeTopic) ? (
            <StyledValue>
              {unsubscribeTopic.name ?? t`Untitled topic`}
            </StyledValue>
          ) : (
            isTopicUnresolved && (
              <StyledEmptyValue>{t`Unavailable`}</StyledEmptyValue>
            )
          )}
        </CampaignEnvelopeRow>
      )}
      <CampaignEnvelopeRow label={t`Subject`}>
        {isNonEmptyString(subject) ? (
          <StyledValue>{subject}</StyledValue>
        ) : (
          <StyledEmptyValue>{t`No subject`}</StyledEmptyValue>
        )}
      </CampaignEnvelopeRow>
      {isNonEmptyString(scheduledSendTime) && (
        <CampaignEnvelopeRow label={t`Scheduled at`}>
          <StyledValue>{scheduledSendTime}</StyledValue>
        </CampaignEnvelopeRow>
      )}
    </CampaignEnvelopeBox>
  );
};
