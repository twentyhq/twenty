import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  CoreObjectNameSingular,
  MessageChannelType,
  SettingsPath,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/feedback';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { useCampaignDetailsState } from '@/activities/emails/hooks/useCampaignDetailsState';
import { useCampaignSendQuota } from '@/activities/emails/hooks/useCampaignSendQuota';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { Select } from '@/ui/input/components/Select';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

type CampaignAudiencePreview = NonNullable<
  ReturnType<typeof useCampaignAudiencePreview>
>;

const buildAudienceHint = (preview: CampaignAudiencePreview): string => {
  const parts: string[] = [];

  if (preview.withoutEmail > 0) {
    parts.push(t`${preview.withoutEmail} without email`);
  }
  if (preview.duplicateEmails > 0) {
    parts.push(t`${preview.duplicateEmails} duplicate`);
  }
  if (preview.globallyUnsubscribed > 0) {
    parts.push(t`${preview.globallyUnsubscribed} unsubscribed from everything`);
  }
  if (preview.topicUnsubscribed > 0) {
    parts.push(t`${preview.topicUnsubscribed} opted out of this topic`);
  }

  if (parts.length === 0) {
    return t`${preview.totalMembers} in this list`;
  }

  const breakdown = parts.join(', ');

  // Without exclusions every member is sendable, so the count is only worth
  // spelling out when the two differ.
  return t`${preview.totalMembers} in this list, ${preview.sendable} sendable (${breakdown})`;
};

const buildQuotaHint = (remaining: number): string => {
  if (remaining === 0) {
    return t`You have reached today's sending limit. Contact support@twenty.com to raise it.`;
  }

  if (remaining === 1) {
    return t`1 email left today`;
  }

  return t`${remaining} emails left today`;
};

type CampaignDetailsFieldsProps = {
  campaign: MessageCampaign;
};

export const CampaignDetailsFields = ({
  campaign,
}: CampaignDetailsFieldsProps) => {
  const detailsState = useCampaignDetailsState({ campaign });

  const navigateSettings = useNavigateSettings();
  const { channels, loading: channelsLoading } = useMyMessageChannels();
  const { unsubscribeTopics } = useUnsubscribeTopics();
  const sendQuota = useCampaignSendQuota();
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

  const audiencePreview = useCampaignAudiencePreview({
    listId: detailsState.listId,
    unsubscribeTopicId: detailsState.unsubscribeTopicId,
  });

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

  return (
    <StyledFieldsContainer onBlur={() => detailsState.flush()}>
      {!channelsLoading && senderOptions.length === 0 && (
        <Callout
          variant="info"
          title={t`No sending address yet`}
          description={t`Set up an email group channel before you can send campaigns.`}
          action={{
            label: t`Go to Communications`,
            onClick: () =>
              navigateSettings(SettingsPath.WorkspaceCommunications),
          }}
        />
      )}
      <Select
        dropdownId="campaign-composer-from-account"
        label={t`From`}
        fullWidth
        value={detailsState.fromAddress}
        options={senderOptions}
        emptyOption={{ label: t`Select a sender`, value: '' }}
        onChange={detailsState.setFromAddress}
      />
      <FormSingleRecordPicker
        label={t`To`}
        objectNameSingulars={[CoreObjectNameSingular.MessageList]}
        defaultValue={detailsState.listId}
        onChange={detailsState.setListId}
        onCreate={handleCreateList}
      />
      {isDefined(audiencePreview) && (
        <StyledHint>{buildAudienceHint(audiencePreview)}</StyledHint>
      )}
      {isDefined(sendQuota?.remaining) && (
        <StyledHint>{buildQuotaHint(sendQuota.remaining)}</StyledHint>
      )}
      {topicOptions.length > 0 && (
        <>
          <Select
            dropdownId="campaign-composer-unsubscribe-topic"
            label={t`Unsubscribe topic`}
            fullWidth
            value={detailsState.unsubscribeTopicId ?? ''}
            options={topicOptions}
            emptyOption={{ label: t`No topic`, value: '' }}
            onChange={(value) =>
              detailsState.setUnsubscribeTopicId(value === '' ? null : value)
            }
          />
          <StyledHint>
            {t`The unsubscribe topic this email belongs to. Recipients who opted out of it are skipped, and the unsubscribe link is scoped to it.`}
          </StyledHint>
        </>
      )}
      <FormTextFieldInput
        label={t`Subject`}
        defaultValue={detailsState.subject}
        onChange={detailsState.setSubject}
        placeholder={t`Subject`}
      />
    </StyledFieldsContainer>
  );
};
