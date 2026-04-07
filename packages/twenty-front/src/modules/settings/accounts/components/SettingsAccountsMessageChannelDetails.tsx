import { styled } from '@linaria/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { UPDATE_MESSAGE_CHANNEL } from '@/settings/accounts/graphql/mutations/updateMessageChannel';
import { useMutation } from '@apollo/client/react';
import { SettingsAccountsMessageAutoCreationCard } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationCard';
import { SettingsAccountsMessageFolderCard } from '@/settings/accounts/components/SettingsAccountsMessageFolderCard';
import { SettingsAccountsMessageVisibilityCard } from '@/settings/accounts/components/SettingsAccountsMessageVisibilityCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { t } from '@lingui/core/macro';
import { H2Title, IconBriefcase, IconUsers } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type MessageChannelVisibility } from '~/generated/graphql';
import {
  type MessageChannelContactAutoCreationPolicy,
  type MessageFolderImportPolicy,
} from 'twenty-shared/types';

type SettingsAccountsMessageChannelDetailsProps = {
  messageChannel: Pick<
    MessageChannel,
    | 'id'
    | 'visibility'
    | 'contactAutoCreationPolicy'
    | 'excludeNonProfessionalEmails'
    | 'excludeGroupEmails'
    | 'isSyncEnabled'
    | 'messageFolderImportPolicy'
  >;
};

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
`;

export const SettingsAccountsMessageChannelDetails = ({
  messageChannel,
}: SettingsAccountsMessageChannelDetailsProps) => {
  const [updateMetadataChannel] = useMutation(UPDATE_MESSAGE_CHANNEL);

  const updateChannel = (update: Record<string, unknown>) => {
    updateMetadataChannel({
      variables: { input: { id: messageChannel.id, update } },
    });
  };

  const handleVisibilityChange = (value: MessageChannelVisibility) => {
    updateChannel({ visibility: value });
  };

  const handleContactAutoCreationChange = (
    value: MessageChannelContactAutoCreationPolicy,
  ) => {
    updateChannel({ contactAutoCreationPolicy: value });
  };

  const handleIsGroupEmailExcludedToggle = (value: boolean) => {
    updateChannel({ excludeGroupEmails: value });
  };

  const handleIsNonProfessionalEmailExcludedToggle = (value: boolean) => {
    updateChannel({ excludeNonProfessionalEmails: value });
  };

  const handleMessageFolderImportPolicyChange = (
    value: MessageFolderImportPolicy,
  ) => {
    updateChannel({ messageFolderImportPolicy: value });
  };

  return (
    <StyledDetailsContainer>
      <Section>
        <H2Title
          title={t`Import`}
          description={t`Emails from the blocklist will be ignored. Manage blocklist on the "Accounts" setting page.`}
        />
        <SettingsAccountsMessageFolderCard
          onChange={handleMessageFolderImportPolicyChange}
          value={messageChannel.messageFolderImportPolicy}
        />
      </Section>
      <Section>
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconUsers}
            title={t`Exclude group emails`}
            description={t`Don't sync emails from team@ support@ noreply@...`}
            checked={messageChannel.excludeGroupEmails}
            onChange={() =>
              handleIsGroupEmailExcludedToggle(
                !messageChannel.excludeGroupEmails,
              )
            }
          />
        </Card>
      </Section>
      <Section>
        <H2Title
          title={t`Visibility`}
          description={t`Define what will be visible to other users in your workspace`}
        />
        <SettingsAccountsMessageVisibilityCard
          value={messageChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section>
      <Section>
        <H2Title
          title={t`Contact auto-creation`}
          description={t`Automatically create People records when receiving or sending emails`}
        />
        <SettingsAccountsMessageAutoCreationCard
          value={messageChannel.contactAutoCreationPolicy}
          onChange={handleContactAutoCreationChange}
        />
      </Section>
      <Section>
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconBriefcase}
            title={t`Exclude non-professional emails`}
            description={t`Don't create contacts from/to Gmail, Outlook emails`}
            checked={messageChannel.excludeNonProfessionalEmails}
            onChange={() => {
              handleIsNonProfessionalEmailExcludedToggle(
                !messageChannel.excludeNonProfessionalEmails,
              );
            }}
          />
        </Card>
      </Section>
    </StyledDetailsContainer>
  );
};
