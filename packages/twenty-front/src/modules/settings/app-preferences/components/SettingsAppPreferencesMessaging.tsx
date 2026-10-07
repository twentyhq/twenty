import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageAutoCreationCard } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationCard';
import { SettingsAccountsMessageFolderCard } from '@/settings/accounts/components/SettingsAccountsMessageFolderCard';
import { SettingsAccountsMessageVisibilityCard } from '@/settings/accounts/components/SettingsAccountsMessageVisibilityCard';
import { UPDATE_MESSAGE_CHANNEL } from '@/settings/accounts/graphql/mutations/updateMessageChannel';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconBriefcase, IconUsers } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

type MessagePreferences = Pick<
  MessageChannel,
  | 'visibility'
  | 'contactAutoCreationPolicy'
  | 'excludeNonProfessionalEmails'
  | 'excludeGroupEmails'
  | 'messageFolderImportPolicy'
>;

type SettingsAppPreferencesMessagingProps = {
  messageChannel: MessagePreferences & Pick<MessageChannel, 'id'>;
};

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

export const SettingsAppPreferencesMessaging = ({
  messageChannel,
}: SettingsAppPreferencesMessagingProps) => {
  const { t } = useLingui();
  const [updateMessageChannel] = useMutation(UPDATE_MESSAGE_CHANNEL);
  const updateChannel = (update: Partial<MessagePreferences>) =>
    updateMessageChannel({
      variables: { input: { id: messageChannel.id, update } },
    });

  return (
    <StyledDetails>
      <Section.Root>
        <Section.Header
          title={t`Import`}
          description={t`Emails from the blocklist will be ignored regardless of this setting.`}
        />
        <SettingsAccountsMessageFolderCard
          value={messageChannel.messageFolderImportPolicy}
          onChange={(messageFolderImportPolicy) =>
            updateChannel({ messageFolderImportPolicy })
          }
        />
      </Section.Root>
      <Card.Root rounded>
        <SettingsOptionCardContentSwitch
          Icon={IconUsers}
          title={t`Exclude group emails`}
          description={t`Don't import emails from team@ support@ noreply@...`}
          checked={messageChannel.excludeGroupEmails}
          onChange={(excludeGroupEmails) =>
            updateChannel({ excludeGroupEmails })
          }
        />
      </Card.Root>
      <Section.Root>
        <Section.Header
          title={t`Visibility`}
          description={t`Define what will be visible to other users in your workspace`}
        />
        <SettingsAccountsMessageVisibilityCard
          value={messageChannel.visibility}
          onChange={(visibility) => updateChannel({ visibility })}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Contact auto-creation`}
          description={t`Automatically create People records when receiving or sending emails`}
        />
        <SettingsAccountsMessageAutoCreationCard
          value={messageChannel.contactAutoCreationPolicy}
          onChange={(contactAutoCreationPolicy) =>
            updateChannel({ contactAutoCreationPolicy })
          }
        />
      </Section.Root>
      <Card.Root rounded>
        <SettingsOptionCardContentSwitch
          Icon={IconBriefcase}
          title={t`Exclude non-professional emails`}
          description={t`Don't create contacts from/to Gmail, Outlook emails`}
          checked={messageChannel.excludeNonProfessionalEmails}
          onChange={(excludeNonProfessionalEmails) =>
            updateChannel({ excludeNonProfessionalEmails })
          }
        />
      </Card.Root>
    </StyledDetails>
  );
};
