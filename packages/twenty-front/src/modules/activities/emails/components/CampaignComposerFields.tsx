import { styled } from '@linaria/react';

import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { type useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

  const breakdown = parts.length > 0 ? ` (${parts.join(', ')})` : '';

  return (
    t`${preview.totalMembers} in this list — ${preview.sendable} sendable` +
    breakdown
  );
};

type CampaignComposerFieldsProps = {
  campaignState: ReturnType<typeof useCampaignComposerState>;
};

export const CampaignComposerFields = ({
  campaignState,
}: CampaignComposerFieldsProps) => {
  const { channels } = useMyMessageChannels();
  const { unsubscribeTopics } = useUnsubscribeTopics();
  const { createOneRecord: createMessageList } = useCreateOneRecord({
    objectNameSingular: 'messageList',
  });

  const handleCreateList = async (searchInput?: string) => {
    const listName = searchInput?.trim() ?? '';
    const createdList = await createMessageList({
      name: listName.length > 0 ? listName : t`Untitled list`,
    });

    if (isDefined(createdList)) {
      campaignState.setListId(createdList.id);
    }
  };

  const audiencePreview = useCampaignAudiencePreview({
    listId: campaignState.listId,
    unsubscribeTopicId: campaignState.unsubscribeTopicId,
  });

  // Campaigns send from the workspace's shared email channels (the verified
  // emailing-domain senders), not personal connected accounts.
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
    <StyledFieldsContainer>
      <Select
        dropdownId="campaign-composer-from-account"
        label={t`From`}
        fullWidth
        value={campaignState.fromAddress}
        options={senderOptions}
        emptyOption={{ label: t`Select a sender`, value: '' }}
        onChange={campaignState.setFromAddress}
      />
      <FormSingleRecordPicker
        label={t`To`}
        objectNameSingulars={['messageList']}
        defaultValue={campaignState.listId}
        onChange={campaignState.setListId}
        onCreate={handleCreateList}
      />
      {isDefined(audiencePreview) && (
        <StyledHint>{buildAudienceHint(audiencePreview)}</StyledHint>
      )}
      <Select
        dropdownId="campaign-composer-unsubscribe-topic"
        label={t`Unsubscribe topic`}
        fullWidth
        value={campaignState.unsubscribeTopicId ?? ''}
        options={topicOptions}
        emptyOption={{ label: t`No topic`, value: '' }}
        onChange={(value) =>
          campaignState.setUnsubscribeTopicId(value === '' ? null : value)
        }
      />
      <StyledHint>
        {t`The unsubscribe topic this email belongs to. Recipients who opted out of it are skipped, and the unsubscribe link is scoped to it.`}
      </StyledHint>
      <FormTextFieldInput
        label={t`Subject`}
        defaultValue={campaignState.subject}
        onChange={campaignState.setSubject}
        placeholder={t`Subject`}
      />
      <FormAdvancedTextFieldInput
        defaultValue=""
        onChange={campaignState.setBody}
        placeholder={t`Type something or press "/" to see commands`}
        minHeight={120}
        maxWidth={600}
        contentType="html"
      />
    </StyledFieldsContainer>
  );
};
