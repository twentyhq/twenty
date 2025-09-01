import styled from '@emotion/styled';

import {
  type MessageChannel,
  type MessageChannelContactAutoCreationPolicy,
} from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsMessageAutoCreationCard } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationCard';
import { SettingsAccountsMessageFoldersCard } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFoldersCard';
import { SettingsAccountsMessageVisibilityCard } from '@/settings/accounts/components/SettingsAccountsMessageVisibilityCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { H2Title, IconBriefcase, IconUsers } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import {
  FeatureFlagKey,
  type MessageChannelVisibility,
} from '~/generated-metadata/graphql';

type SettingsAccountsMessageChannelDetailsProps = {
  messageChannel: Pick<
    MessageChannel,
    | 'id'
    | 'visibility'
    | 'contactAutoCreationPolicy'
    | 'excludeNonProfessionalEmails'
    | 'excludeGroupEmails'
    | 'isSyncEnabled'
    | 'messageFolders'
  >;
};

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsMessageChannelDetails = ({
  messageChannel,
}: SettingsAccountsMessageChannelDetailsProps) => {
  const { updateOneRecord } = useUpdateOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
  });

  const isFolderControlEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_FOLDER_CONTROL_ENABLED,
  );

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
      {isFolderControlEnabled && messageChannel.messageFolders && (
        <Section>
          <H2Title
            title={t`Folder Management`}
            description={t`Control which folders are synced`}
          />
          <SettingsAccountsMessageFoldersCard
            messageChannelId={messageChannel.id}
            messageFolders={messageChannel.messageFolders}
          />
        </Section>
      )}
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
            description={t`Don’t create contacts from/to Gmail, Outlook emails`}
            divider
            checked={messageChannel.excludeNonProfessionalEmails}
            onChange={() => {
              handleIsNonProfessionalEmailExcludedToggle(
                !messageChannel.excludeNonProfessionalEmails,
              );
            }}
          />
          <SettingsOptionCardContentToggle
            Icon={IconUsers}
            title={t`Exclude group emails`}
            description={t`Don’t sync emails from team@ support@ noreply@...`}
            checked={messageChannel.excludeGroupEmails}
            onChange={() =>
              handleIsGroupEmailExcludedToggle(
                !messageChannel.excludeGroupEmails,
              )
            }
          />
        </Card>
      </Section>
    </StyledDetailsContainer>
  );
};
