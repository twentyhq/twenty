import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';
import { campaignDeliveryFamilyState } from '@/activities/emails/states/campaignDeliveryFamilyState';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { buildCampaignDeliveryHint } from '@/activities/emails/utils/buildCampaignDeliveryHint';
import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';
import { formatCampaignSendTime } from '@/activities/emails/utils/formatCampaignSendTime';
import { formatDisplayList } from '@/ai/utils/tool-display/formatDisplayList';
import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SendMessageCampaignSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const campaignId = selectedRecords[0]?.id;

  const { sendMessageCampaign } = useSendMessageCampaign();
  const { formatNumber } = useNumberFormat();
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const [campaignDelivery, setCampaignDelivery] = useAtomFamilyState(
    campaignDeliveryFamilyState,
    campaignId ?? '',
  );

  const { record: campaign } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: campaignId ?? '',
    skip: !isDefined(campaignId),
  });

  const hasList = isNonEmptyString(campaign?.listId);

  const { record: list, loading: isListLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: campaign?.listId ?? '',
    skip: !hasList,
  });

  const { audiencePreview, hasFailed: hasAudiencePreviewFailed } =
    useCampaignAudiencePreview({
      listId: campaign?.listId ?? null,
      unsubscribeTopicId: campaign?.unsubscribeTopicId ?? null,
    });

  if (!isDefined(campaignId)) {
    throw new Error('Record ID is required to send the campaign');
  }

  const isAudienceSettled =
    !hasList ||
    (!isListLoading &&
      (isDefined(audiencePreview) || hasAudiencePreviewFailed));

  if (!isDefined(campaign) || !isAudienceSettled) {
    return null;
  }

  const isAlreadyScheduled =
    campaign.status === MessageCampaignStatus.SCHEDULED;
  const deliveryTiming = isAlreadyScheduled ? 'NOW' : campaignDelivery.timing;
  const scheduledAt = campaignDelivery.scheduledAt;

  const isScheduledInTheFuture =
    isNonEmptyString(scheduledAt) &&
    new Date(scheduledAt).getTime() > Date.now();

  const formatSendTime = (value: string) =>
    formatCampaignSendTime({
      value,
      timeZone,
      dateFormat,
      timeFormat,
      localeCatalog,
    });

  const deliveryHint = buildCampaignDeliveryHint({
    deliveryTiming,
    isAlreadyScheduled,
    formattedSendTime: isScheduledInTheFuture
      ? formatSendTime(scheduledAt)
      : null,
  });

  const missingDetails = [
    isDefined(list) ? null : t`a list`,
    isNonEmptyString(campaign.fromAddress?.primaryEmail) ? null : t`a sender`,
    isNonEmptyString(campaign.subject) ? null : t`a subject`,
    isNonEmptyString(campaign.bodyTemplate) ? null : t`some content`,
  ].filter(isNonEmptyString);

  if (missingDetails.length > 0) {
    return (
      <HeadlessConfirmationModalEngineCommandEffect
        title={t`Campaign Not Ready`}
        subtitle={t`Add ${formatDisplayList(missingDetails)} before sending.`}
        confirmButtonText={t`OK`}
        confirmButtonColor="accent"
        execute={() => undefined}
      />
    );
  }

  if (isDefined(audiencePreview) && audiencePreview.sendable === 0) {
    return (
      <HeadlessConfirmationModalEngineCommandEffect
        title={t`Campaign Not Ready`}
        subtitle={t`No one on this list can receive this campaign.`}
        confirmButtonText={t`OK`}
        confirmButtonColor="accent"
        execute={() => undefined}
      />
    );
  }

  if (deliveryTiming === 'LATER' && !isScheduledInTheFuture) {
    return (
      <HeadlessConfirmationModalEngineCommandEffect
        title={t`Campaign Not Ready`}
        subtitle={deliveryHint}
        confirmButtonText={t`OK`}
        confirmButtonColor="accent"
        execute={() => undefined}
      />
    );
  }

  const excludedReasons = isDefined(audiencePreview)
    ? buildExcludedRecipientReasons({ counts: audiencePreview, formatNumber })
    : [];

  const subtitle = [
    isAlreadyScheduled && isNonEmptyString(campaign.scheduledAt)
      ? t`This campaign is scheduled for ${formatSendTime(campaign.scheduledAt)}.`
      : null,
    isDefined(audiencePreview)
      ? plural(audiencePreview.sendable, {
          one: `${formatNumber(audiencePreview.sendable)} recipient will get this email.`,
          other: `${formatNumber(audiencePreview.sendable)} recipients will get this email.`,
        })
      : t`The recipient count is unavailable.`,
    isDefined(audiencePreview) && excludedReasons.length > 0
      ? t`${formatNumber(audiencePreview.totalMembers)} in the list, skipping ${excludedReasons.join(', ')}.`
      : null,
    deliveryHint,
  ]
    .filter(isNonEmptyString)
    .join(' ');

  if (deliveryTiming === 'LATER' && isNonEmptyString(scheduledAt)) {
    const handleSchedule = async () => {
      const isScheduled = await sendMessageCampaign({
        campaignId,
        scheduledAt,
      });

      if (isScheduled) {
        setCampaignDelivery({ timing: 'NOW', scheduledAt: null });
      }
    };

    return (
      <HeadlessConfirmationModalEngineCommandEffect
        title={t`Schedule Campaign`}
        subtitle={subtitle}
        confirmButtonText={t`Schedule Campaign`}
        confirmButtonColor="accent"
        execute={handleSchedule}
      />
    );
  }

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={isAlreadyScheduled ? t`Send Campaign Now` : t`Send Campaign`}
      subtitle={subtitle}
      confirmButtonText={isAlreadyScheduled ? t`Send Now` : t`Send Campaign`}
      confirmButtonColor="accent"
      execute={() =>
        sendMessageCampaign({
          campaignId,
          wasAlreadyScheduled: isAlreadyScheduled,
        })
      }
    />
  );
};
