import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  CoreObjectNameSingular,
  MessageCampaignStatus,
} from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconClock, IconSend } from 'twenty-ui/icon';
import { Button, type SelectOption } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useCampaignSendPreview } from '@/activities/emails/hooks/useCampaignSendPreview';
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
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '@/localization/states/dateLocaleState';

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

  const hasList = isDefined(campaign.listId) && isValidUuid(campaign.listId);

  const { record: list, loading: isListLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: campaign.listId ?? '',
    withSoftDeleted: true,
    skip: !hasList,
  });

  const isListUnresolved = hasList && !isDefined(list) && !isListLoading;

  const isScheduling = deliveryTiming === 'LATER';

  const { sendPreview, hasFailed: hasSendPreviewFailed } =
    useCampaignSendPreview({
      campaignId: campaign.id,
      scheduledAt: isScheduling ? scheduledAt : null,
    });

  const audiencePreview = sendPreview?.audience ?? null;
  const sendBlockers = sendPreview?.blockers ?? [];

  const fromAddress = campaign.fromAddress?.primaryEmail;
  const subject = campaign.subject;

  const excludedReasons = isDefined(audiencePreview)
    ? buildExcludedRecipientReasons({ counts: audiencePreview, formatNumber })
    : [];

  const isMissingSendTime = isScheduling && !isNonEmptyString(scheduledAt);

  const formattedSendTime = isNonEmptyString(scheduledAt)
    ? formatCampaignSendTime({
        value: scheduledAt,
        timeZone,
        dateFormat,
        timeFormat,
        localeCatalog,
      })
    : null;

  const deliveryTimingOptions: SelectOption<CampaignDeliveryTiming>[] = [
    { label: t`Send now`, value: 'NOW' },
    { label: t`Send later`, value: 'LATER' },
  ];

  const deliveryHint = buildCampaignDeliveryHint({
    deliveryTiming,
    isAlreadyScheduled,
    formattedSendTime,
  });

  const sendPreviewStatusMessage = hasSendPreviewFailed
    ? t`Recipient count unavailable.`
    : t`Counting recipients...`;

  const sendDisabledReason = isDefined(sendPreview)
    ? (sendBlockers[0]?.message ?? (isMissingSendTime ? deliveryHint : null))
    : sendPreviewStatusMessage;

  const canSend = !isDefined(sendDisabledReason);

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
          <StyledDisplayLabel>{t`Recipients`}</StyledDisplayLabel>
          {!isDefined(sendPreview) && (
            <StyledHint>{sendPreviewStatusMessage}</StyledHint>
          )}
          {isDefined(audiencePreview) && (
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
              {audiencePreview.trackingRefused > 0 && (
                <StyledHint>
                  {t`${formatNumber(audiencePreview.trackingRefused)} opted out of email tracking, their opens and clicks are not recorded`}
                </StyledHint>
              )}
              {isScheduling && (
                <StyledHint>
                  {t`Counted again when the campaign sends, so this can change.`}
                </StyledHint>
              )}
            </>
          )}
          {sendBlockers.map((sendBlocker) => (
            <StyledErrorHint key={sendBlocker.message}>
              {sendBlocker.message}
            </StyledErrorHint>
          ))}
        </StyledSection>
        <StyledSection>
          <StyledDisplayLabel>{t`List`}</StyledDisplayLabel>
          {isDefined(list) ? (
            <RecordChip
              record={list}
              objectNameSingular={CoreObjectNameSingular.MessageList}
            />
          ) : !hasList ? (
            <StyledValue $isEmpty>{t`No list`}</StyledValue>
          ) : (
            isListUnresolved && (
              <StyledValue $isEmpty>{t`Unavailable`}</StyledValue>
            )
          )}
        </StyledSection>
        <StyledSection>
          <StyledDisplayLabel>{t`From`}</StyledDisplayLabel>
          <StyledValue $isEmpty={!isNonEmptyString(fromAddress)}>
            {isNonEmptyString(fromAddress) ? fromAddress : t`No sender`}
          </StyledValue>
        </StyledSection>
        <StyledSection>
          <StyledDisplayLabel>{t`Subject`}</StyledDisplayLabel>
          <StyledValue $isEmpty={!isNonEmptyString(subject)}>
            {isNonEmptyString(subject) ? subject : t`No subject`}
          </StyledValue>
        </StyledSection>
        <StyledSection>
          <StyledDisplayLabel>{t`Delivery`}</StyledDisplayLabel>
          <StyledDeliveryFields>
            <Select
              dropdownId="send-campaign-delivery-timing"
              fullWidth
              value={deliveryTiming}
              options={deliveryTimingOptions}
              onChange={handleDeliveryTimingChange}
            />
            {isMissingSendTime ? (
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
          <Tooltip
            key="send"
            content={sendDisabledReason}
            side="top"
            positionMethod="fixed"
            delay={TooltipDelay.shortDelay}
            disabled={canSend}
          >
            <span tabIndex={canSend ? undefined : 0}>
              <Button
                startIcon={isScheduling ? <IconClock /> : <IconSend />}
                size="sm"
                disabled={!canSend || isSending}
                onClick={handleSend}
                variant="solid"
                color="accent"
              >
                {buildCampaignSendButtonTitle({
                  deliveryTiming,
                  isAlreadyScheduled,
                })}
              </Button>
            </span>
          </Tooltip>,
        ]}
      />
    </StyledContainer>
  );
};

const StyledDisplayLabel = styled(Text)`
  color: var(--t-font-color-light);
  font-size: 11px;
  font-weight: var(--t-font-weight-semi-bold);
`;
