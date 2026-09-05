import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconSend } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Label } from 'twenty-ui/typography';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { buildExcludedRecipientReasons } from '@/activities/emails/utils/buildExcludedRecipientReasons';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sendCampaignCampaignIdComponentState } from '@/side-panel/pages/send-campaign/states/sendCampaignCampaignIdComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

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

export const SidePanelSendCampaignPage = () => {
  const sendCampaignCampaignId = useAtomComponentStateValue(
    sendCampaignCampaignIdComponentState,
  );

  const { goBackFromSidePanel } = useSidePanelHistory();
  const { formatNumber } = useNumberFormat();
  const { sendMessageCampaign, loading: isSending } = useSendMessageCampaign();

  const { record: campaign } = useFindOneRecord<MessageCampaign>({
    objectNameSingular: CoreObjectNameSingular.MessageCampaign,
    objectRecordId: sendCampaignCampaignId,
  });

  const listId = campaign?.listId ?? null;

  const { record: list } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    objectRecordId: listId ?? '',
    skip: !isDefined(listId),
  });

  const { audiencePreview, hasFailed: hasAudiencePreviewFailed } =
    useCampaignAudiencePreview({
      listId,
      unsubscribeTopicId: campaign?.unsubscribeTopicId ?? null,
    });

  if (!isDefined(campaign)) {
    return null;
  }

  const fromAddress = campaign.fromAddress?.primaryEmail;
  const subject = campaign.subject;

  const excludedReasons = isDefined(audiencePreview)
    ? buildExcludedRecipientReasons({ counts: audiencePreview, formatNumber })
    : [];

  const canSend =
    isDefined(list) &&
    isNonEmptyString(fromAddress) &&
    isNonEmptyString(subject) &&
    isNonEmptyString(campaign.bodyTemplate) &&
    isDefined(audiencePreview) &&
    audiencePreview.sendable > 0;

  const handleSend = async () => {
    const sent = await sendMessageCampaign({
      campaignId: sendCampaignCampaignId,
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
        <StyledHint>
          {t`Sending starts right away and cannot be undone.`}
        </StyledHint>
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="send"
            title={t`Send campaign`}
            Icon={IconSend}
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
