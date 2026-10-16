import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { SegmentedControl } from 'twenty-ui/components/input';
import { IconClock, IconSend } from 'twenty-ui/icon';
import { Button, Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type CampaignDeliveryTiming } from '@/activities/emails/types/CampaignDeliveryTiming';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { buildCampaignDeliveryHint } from '@/activities/emails/utils/buildCampaignDeliveryHint';
import { buildCampaignSendButtonTitle } from '@/activities/emails/utils/buildCampaignSendButtonTitle';
import { buildDefaultCampaignScheduledAt } from '@/activities/emails/utils/buildDefaultCampaignScheduledAt';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SendCampaignRecipientsCard } from '@/side-panel/pages/send-campaign/components/SendCampaignRecipientsCard';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

type SendCampaignFormProps = {
  campaign: MessageCampaign;
};

export const SendCampaignForm = ({ campaign }: SendCampaignFormProps) => {
  const isAlreadyScheduled =
    campaign.status === MessageCampaignStatus.SCHEDULED;
  const hasList = isNonEmptyString(campaign.listId);

  const { closeSidePanelMenu } = useSidePanelMenu();
  const { formatNumber } = useNumberFormat();
  const { sendMessageCampaign, loading: isSending } = useSendMessageCampaign();
  const { unsubscribeTopics } = useUnsubscribeTopics();

  const [deliveryTiming, setDeliveryTiming] = useState<CampaignDeliveryTiming>(
    isAlreadyScheduled ? 'LATER' : doNotTranslate('NOW'),
  );
  const [scheduledAt, setScheduledAt] = useState<string | null>(
    campaign.scheduledAt,
  );

  const { record: list } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: campaign.listId ?? '',
    skip: !hasList,
  });

  const { audiencePreview, hasFailed: hasAudiencePreviewFailed } =
    useCampaignAudiencePreview({
      listId: campaign.listId,
      unsubscribeTopicId: campaign.unsubscribeTopicId,
    });

  const listName = isNonEmptyString(list?.name) ? list.name : null;
  const topicName =
    unsubscribeTopics.find((topic) => topic.id === campaign.unsubscribeTopicId)
      ?.name ?? null;

  const isScheduling = deliveryTiming === 'LATER';
  const isScheduledInTheFuture =
    isNonEmptyString(scheduledAt) &&
    new Date(scheduledAt).getTime() > Date.now();
  const hasInvalidSendTime = isScheduling && !isScheduledInTheFuture;

  const deliveryHint = buildCampaignDeliveryHint({
    deliveryTiming,
    isAlreadyScheduled,
    hasValidSendTime: isScheduledInTheFuture,
  });

  const missingDetails = [
    hasList ? null : t`a list`,
    isNonEmptyString(campaign.fromAddress?.primaryEmail) ? null : t`a sender`,
    isNonEmptyString(campaign.subject) ? null : t`a subject`,
    isNonEmptyString(campaign.bodyTemplate) ? null : t`some content`,
  ].filter(isNonEmptyString);

  const hasNoReachableRecipient =
    isDefined(audiencePreview) && audiencePreview.sendable === 0;

  const blockingMessage =
    missingDetails.length > 0
      ? t`Add ${formatDisplayList(missingDetails)} before sending.`
      : hasNoReachableRecipient
        ? t`No one on this list can receive this campaign.`
        : null;

  const isAudienceSettled =
    isDefined(audiencePreview) || hasAudiencePreviewFailed;

  const canSend =
    !isDefined(blockingMessage) &&
    isAudienceSettled &&
    !hasInvalidSendTime &&
    !isSending;

  const trackingRefusedHint =
    isDefined(audiencePreview) && audiencePreview.trackingRefused > 0
      ? t`${formatNumber(audiencePreview.trackingRefused)} opted out of email tracking, their clicks are not recorded.`
      : null;

  const handleDeliveryTimingChange = (timing: CampaignDeliveryTiming) => {
    setDeliveryTiming(timing);

    if (timing === 'LATER' && !isNonEmptyString(scheduledAt)) {
      setScheduledAt(buildDefaultCampaignScheduledAt().toISOString());
    }
  };

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const isSent = await sendMessageCampaign({
      campaignId: campaign.id,
      scheduledAt: isScheduling ? (scheduledAt ?? undefined) : undefined,
      wasAlreadyScheduled: isAlreadyScheduled,
    });

    if (isSent) {
      closeSidePanelMenu();
    }
  };

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: handleSend,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSend],
  });

  return (
    <StyledContainer>
      <StyledContent>
        {isDefined(blockingMessage) && (
          <SidePanelInformationBanner
            variant="warning"
            message={blockingMessage}
          />
        )}
        {hasList && (
          <FormFieldInputContainer>
            <Field.Label>{t`Recipients`}</Field.Label>
            {isDefined(audiencePreview) ? (
              <SendCampaignRecipientsCard
                audiencePreview={audiencePreview}
                listName={listName}
                topicName={topicName}
              />
            ) : (
              <Field.Description>
                {hasAudiencePreviewFailed
                  ? t`Recipient count unavailable`
                  : t`Counting recipients...`}
              </Field.Description>
            )}
            {isDefined(trackingRefusedHint) && (
              <Field.Description>{trackingRefusedHint}</Field.Description>
            )}
          </FormFieldInputContainer>
        )}
        <FormFieldInputContainer>
          <Field.Label>{t`Delivery`}</Field.Label>
          <SegmentedControl
            aria-label={t`Delivery`}
            value={deliveryTiming}
            onValueChange={handleDeliveryTimingChange}
            options={[
              { value: doNotTranslate('NOW'), label: t`Send now` },
              { value: 'LATER', label: t`Send later` },
            ]}
          />
          {hasInvalidSendTime ? (
            <Field.Error match>{deliveryHint}</Field.Error>
          ) : (
            <Field.Description>{deliveryHint}</Field.Description>
          )}
        </FormFieldInputContainer>
        {isScheduling && (
          <FormDateTimeFieldInput
            label={t`Send at`}
            defaultValue={scheduledAt ?? undefined}
            onChange={setScheduledAt}
          />
        )}
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="sm"
            variant="outline"
            onClick={closeSidePanelMenu}
          >{t`Cancel`}</Button>,
          <Button
            key="send"
            size="sm"
            variant="solid"
            color="accent"
            startIcon={isScheduling ? <IconClock /> : <IconSend />}
            shortcut={['Mod', 'Enter']}
            loading={isSending}
            disabled={!canSend}
            onClick={handleSend}
          >
            {buildCampaignSendButtonTitle({
              deliveryTiming,
              isAlreadyScheduled,
            })}
          </Button>,
        ]}
      />
    </StyledContainer>
  );
};
