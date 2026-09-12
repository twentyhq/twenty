import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconClock, IconSend } from 'twenty-ui/icon';
import { Button, type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Label } from 'twenty-ui/typography';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { buildDefaultCampaignScheduledAt } from '@/activities/emails/utils/buildDefaultCampaignScheduledAt';
import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';
import { formatCampaignSendTime } from '@/activities/emails/utils/formatCampaignSendTime';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { type CampaignDeliveryTiming } from '@/side-panel/pages/send-campaign/types/CampaignDeliveryTiming';
import { buildCampaignDeliveryHint } from '@/side-panel/pages/send-campaign/utils/buildCampaignDeliveryHint';
import { buildCampaignSendButtonTitle } from '@/side-panel/pages/send-campaign/utils/buildCampaignSendButtonTitle';
import { Select } from '@/ui/input/components/Select';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSection = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRecipientCount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledValue = styled.span<{ $isEmpty: boolean }>`
  color: ${({ $isEmpty }) =>
    $isEmpty
      ? themeCssVariables.font.color.light
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledErrorHint = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDeliveryFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type SendCampaignFormProps = {
  campaign: MessageCampaign;
};

export const SendCampaignForm = ({ campaign }: SendCampaignFormProps) => {
  const isAlreadyScheduled =
    campaign.status === MessageCampaignStatus.SCHEDULED;

  const { goBackFromSidePanel } = useSidePanelHistory();
  const { formatNumber } = useNumberFormat();
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { sendMessageCampaign, loading: isSending } = useSendMessageCampaign();

  const [deliveryTiming, setDeliveryTiming] = useState<CampaignDeliveryTiming>(
    isAlreadyScheduled ? 'LATER' : 'NOW',
  );
  const [scheduledAt, setScheduledAt] = useState<string | null>(
    campaign.scheduledAt,
  );

  const { record: list } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: campaign.listId ?? '',
    skip: !isDefined(campaign.listId),
  });

  const { audiencePreview, hasFailed: hasAudiencePreviewFailed } =
    useCampaignAudiencePreview({
      listId: campaign.listId,
      unsubscribeTopicId: campaign.unsubscribeTopicId,
    });

  const fromAddress = campaign.fromAddress?.primaryEmail;
  const subject = campaign.subject;

  const excludedReasons = isDefined(audiencePreview)
    ? buildExcludedRecipientReasons({ counts: audiencePreview, formatNumber })
    : [];

  const isScheduling = deliveryTiming === 'LATER';

  const isScheduledInTheFuture =
    isNonEmptyString(scheduledAt) &&
    new Date(scheduledAt).getTime() > Date.now();

  const hasInvalidSendTime = isScheduling && !isScheduledInTheFuture;

  const formattedSendTime = isScheduledInTheFuture
    ? formatCampaignSendTime({
        value: scheduledAt,
        timeZone,
        dateFormat,
        timeFormat,
        localeCatalog,
      })
    : null;

  const isCampaignReady =
    isDefined(list) &&
    isNonEmptyString(fromAddress) &&
    isNonEmptyString(subject) &&
    isNonEmptyString(campaign.bodyTemplate) &&
    isDefined(audiencePreview) &&
    audiencePreview.sendable > 0;

  const canSend = isCampaignReady && !hasInvalidSendTime;

  const deliveryTimingOptions: SelectOption<CampaignDeliveryTiming>[] = [
    { label: t`Send now`, value: 'NOW' },
    { label: t`Send later`, value: 'LATER' },
  ];

  const deliveryHint = buildCampaignDeliveryHint({
    deliveryTiming,
    isAlreadyScheduled,
    formattedSendTime,
  });

  const handleDeliveryTimingChange = (timing: CampaignDeliveryTiming) => {
    setDeliveryTiming(timing);

    if (timing === 'LATER' && !isNonEmptyString(scheduledAt)) {
      setScheduledAt(buildDefaultCampaignScheduledAt().toISOString());
    }
  };

  const handleSend = async () => {
    const sent = await sendMessageCampaign({
      campaignId: campaign.id,
      scheduledAt: isScheduling ? (scheduledAt ?? undefined) : undefined,
      wasAlreadyScheduled: isAlreadyScheduled,
    });

    if (sent) {
      goBackFromSidePanel();
    }
  };

  return (
    <StyledContainer>
      <StyledContent>
        <StyledSection>
          <Label>{t`Recipients`}</Label>
          {isDefined(audiencePreview) ? (
            <>
              <StyledRecipientCount>
                {plural(audiencePreview.sendable, {
                  one: `${formatNumber(audiencePreview.sendable)} recipient`,
                  other: `${formatNumber(audiencePreview.sendable)} recipients`,
                })}
              </StyledRecipientCount>
              {excludedReasons.length > 0 && (
                <StyledHint>
                  {t`${formatNumber(audiencePreview.totalMembers)} in the list, skipping ${excludedReasons.join(', ')}`}
                </StyledHint>
              )}
              {isScheduling && (
                <StyledHint>
                  {t`Counted again when the campaign sends, so this can change.`}
                </StyledHint>
              )}
            </>
          ) : (
            <StyledHint>
              {hasAudiencePreviewFailed
                ? t`Recipient count unavailable`
                : t`Counting recipients...`}
            </StyledHint>
          )}
        </StyledSection>
        <StyledSection>
          <Label>{t`List`}</Label>
          {isDefined(list) ? (
            <RecordChip
              record={list}
              objectNameSingular={CoreObjectNameSingular.MessageList}
            />
          ) : (
            <StyledValue $isEmpty>{t`No list`}</StyledValue>
          )}
        </StyledSection>
        <StyledSection>
          <Label>{t`From`}</Label>
          <StyledValue $isEmpty={!isNonEmptyString(fromAddress)}>
            {isNonEmptyString(fromAddress) ? fromAddress : t`No sender`}
          </StyledValue>
        </StyledSection>
        <StyledSection>
          <Label>{t`Subject`}</Label>
          <StyledValue $isEmpty={!isNonEmptyString(subject)}>
            {isNonEmptyString(subject) ? subject : t`No subject`}
          </StyledValue>
        </StyledSection>
        <StyledSection>
          <Label>{t`Delivery`}</Label>
          <StyledDeliveryFields>
            <Select
              dropdownId="send-campaign-delivery-timing"
              fullWidth
              value={deliveryTiming}
              options={deliveryTimingOptions}
              onChange={handleDeliveryTimingChange}
            />
            {hasInvalidSendTime ? (
              <StyledErrorHint>{deliveryHint}</StyledErrorHint>
            ) : (
              <StyledHint>{deliveryHint}</StyledHint>
            )}
            {isScheduling && (
              <FormDateTimeFieldInput
                label={t`Send at`}
                defaultValue={scheduledAt ?? undefined}
                onChange={setScheduledAt}
              />
            )}
          </StyledDeliveryFields>
        </StyledSection>
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="send"
            title={buildCampaignSendButtonTitle({
              deliveryTiming,
              isAlreadyScheduled,
            })}
            Icon={isScheduling ? IconClock : IconSend}
            variant="primary"
            accent="blue"
            size="small"
            disabled={!canSend || isSending}
            onClick={handleSend}
          />,
        ]}
      />
    </StyledContainer>
  );
};
