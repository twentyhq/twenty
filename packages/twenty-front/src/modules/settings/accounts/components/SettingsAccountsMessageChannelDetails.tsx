import styled from '@emotion/styled';
import { H2Title } from 'twenty-ui';

import {
  MessageChannel,
  MessageChannelContactAutoCreationPolicy,
} from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsMessageAutoCreationCard } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationCard';
import { SettingsAccountsMessageVisibilityCard } from '@/settings/accounts/components/SettingsAccountsMessageVisibilityCard';
import { Section } from '@/ui/layout/section/components/Section';
import { MessageChannelVisibility } from '~/generated-metadata/graphql';
import { Card } from '@/ui/layout/card/components/Card';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { Toggle } from '@/ui/input/components/Toggle';

type SettingsAccountsMessageChannelDetailsProps = {
  messageChannel: Pick<
    MessageChannel,
    | 'id'
    | 'visibility'
    | 'contactAutoCreationPolicy'
    | 'excludeNonProfessionalEmails'
    | 'excludeGroupEmails'
    | 'isSyncEnabled'
  >;
};

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

export const SettingsAccountsMessageChannelDetails = ({
  messageChannel,
}: SettingsAccountsMessageChannelDetailsProps) => {
  const { updateOneRecord } = useUpdateOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
  });

  const handleVisibilityChange = (value: MessageChannelVisibility) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        visibility: value,
      },
    });
  };

  const handleContactAutoCreationChange = (
    value: MessageChannelContactAutoCreationPolicy,
  ) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        contactAutoCreationPolicy: value,
      },
    });
  };

  const handleIsGroupEmailExcludedToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        excludeGroupEmails: value,
      },
    });
  };

  const handleIsNonProfessionalEmailExcludedToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        excludeNonProfessionalEmails: value,
      },
    });
  };

  return (
    <StyledDetailsContainer>
      <Section>
        <H2Title
          title="Visibility"
          description="Define what will be visible to other users in your workspace"
        />
        <SettingsAccountsMessageVisibilityCard
          value={messageChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section>
      <Section>
        <H2Title
          title="Contact auto-creation"
          description="Automatically create People records when receiving or sending emails"
        />
        <SettingsAccountsMessageAutoCreationCard
          value={messageChannel.contactAutoCreationPolicy}
          onChange={handleContactAutoCreationChange}
        />
      </Section>
      <Section>
        <Card>
          <SettingsOptionCardContent
            title="Exclude non-professional emails"
            description="Don’t create contacts from/to Gmail, Outlook emails"
            divider
            onClick={() =>
              handleIsNonProfessionalEmailExcludedToggle(
                !messageChannel.excludeNonProfessionalEmails,
              )
            }
          >
            <StyledToggle value={messageChannel.excludeNonProfessionalEmails} />
          </SettingsOptionCardContent>
          <SettingsOptionCardContent
            title="Exclude group emails"
            description="Don’t sync emails from team@ support@ noreply@..."
            onClick={() =>
              handleIsGroupEmailExcludedToggle(
                !messageChannel.excludeGroupEmails,
              )
            }
          >
            <StyledToggle value={messageChannel.excludeGroupEmails} />
          </SettingsOptionCardContent>
        </Card>
      </Section>
    </StyledDetailsContainer>
  );
};
