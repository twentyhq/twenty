import { styled } from '@linaria/react';

import { type useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
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

type CampaignComposerFieldsProps = {
  campaignState: ReturnType<typeof useCampaignComposerState>;
};

export const CampaignComposerFields = ({
  campaignState,
}: CampaignComposerFieldsProps) => {
  const { channels } = useMyMessageChannels();

  // Campaigns send from the workspace's shared email handles (the verified
  // emailing-domain senders), not personal connected accounts.
  const senderOptions: SelectOption<string>[] = channels
    .filter((channel) => channel.type === MessageChannelType.EMAIL_GROUP)
    .map((channel) => channel.connectedAccount?.handle)
    .filter(isDefined)
    .map((handle) => ({ label: handle, value: handle }));

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
      />
      <FormSingleRecordPicker
        label={t`Unsubscribe topic`}
        objectNameSingulars={['messageTopic']}
        defaultValue={campaignState.messageTopicId}
        onChange={campaignState.setMessageTopicId}
      />
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
