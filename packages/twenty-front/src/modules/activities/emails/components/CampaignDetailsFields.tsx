import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  CoreObjectNameSingular,
  MessageChannelType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { EmailComposerFieldRow } from '@/activities/emails/components/EmailComposerFieldRow';
import { useCampaignAudiencePreview } from '@/activities/emails/hooks/useCampaignAudiencePreview';
import { useCampaignDetailsState } from '@/activities/emails/hooks/useCampaignDetailsState';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { Select } from '@/ui/input/components/Select';

// Widest label in the block ("Unsubscribe topic"), so every control starts on
// the same column.
const LABEL_MIN_WIDTH = '116px';

const StyledFieldsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]} 0;
  width: 100%;
`;

// Tracks the body page below rather than the window, so the two read as one
// centred column. The body backdrop supplies the gap between them.
const StyledColumn = styled.div<{ $width: string }>`
  display: flex;
  flex-direction: column;
  max-width: ${({ $width }) => $width};
  min-width: 0;
  width: 100%;
`;

const StyledHeaderRows = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  /* Keeps the row hairlines from crossing the rounded corners. */
  overflow: hidden;
  width: 100%;
`;

const StyledSubjectInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  outline: none;
  padding: 0;
  width: 100%;
`;

const StyledHints = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
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

type CampaignDetailsFieldsProps = {
  campaign: MessageCampaign;
  width: string;
};

export const CampaignDetailsFields = ({
  campaign,
  width,
}: CampaignDetailsFieldsProps) => {
  const detailsState = useCampaignDetailsState({ campaign });

  const { channels } = useMyMessageChannels();
  const { unsubscribeTopics } = useUnsubscribeTopics();
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

  const hasTopicOptions = topicOptions.length > 0;

  return (
    <StyledFieldsContainer onBlur={() => detailsState.flush()}>
      <StyledColumn $width={width}>
        <StyledHeaderRows>
          <EmailComposerFieldRow
            label={t`From`}
            labelMinWidth={LABEL_MIN_WIDTH}
          >
            <Select
              dropdownId="campaign-composer-from-account"
              fullWidth
              value={detailsState.fromAddress}
              options={senderOptions}
              emptyOption={{ label: t`Select a sender`, value: '' }}
              onChange={detailsState.setFromAddress}
            />
          </EmailComposerFieldRow>
          <EmailComposerFieldRow label={t`To`} labelMinWidth={LABEL_MIN_WIDTH}>
            <FormSingleRecordPicker
              key={`list-${detailsState.draftResyncKey}`}
              objectNameSingulars={[CoreObjectNameSingular.MessageList]}
              defaultValue={detailsState.listId}
              onChange={detailsState.setListId}
              onCreate={handleCreateList}
            />
          </EmailComposerFieldRow>
          {hasTopicOptions && (
            <EmailComposerFieldRow
              label={t`Unsubscribe topic`}
              labelMinWidth={LABEL_MIN_WIDTH}
            >
              <Select
                dropdownId="campaign-composer-unsubscribe-topic"
                fullWidth
                value={detailsState.unsubscribeTopicId ?? ''}
                options={topicOptions}
                emptyOption={{ label: t`No topic`, value: '' }}
                onChange={(value) =>
                  detailsState.setUnsubscribeTopicId(
                    value === '' ? null : value,
                  )
                }
              />
            </EmailComposerFieldRow>
          )}
          <EmailComposerFieldRow
            label={t`Subject`}
            labelMinWidth={LABEL_MIN_WIDTH}
          >
            <StyledSubjectInput
              key={`subject-${detailsState.draftResyncKey}`}
              type="text"
              aria-label={t`Subject`}
              defaultValue={detailsState.subject}
              onChange={(event) => detailsState.setSubject(event.target.value)}
            />
          </EmailComposerFieldRow>
        </StyledHeaderRows>
        {(isDefined(audiencePreview) || hasTopicOptions) && (
          <StyledHints>
            {isDefined(audiencePreview) && (
              <StyledHint>{buildAudienceHint(audiencePreview)}</StyledHint>
            )}
            {hasTopicOptions && (
              <StyledHint>
                {t`The unsubscribe topic this email belongs to. Recipients who opted out of it are skipped, and the unsubscribe link is scoped to it.`}
              </StyledHint>
            )}
          </StyledHints>
        )}
      </StyledColumn>
    </StyledFieldsContainer>
  );
};
