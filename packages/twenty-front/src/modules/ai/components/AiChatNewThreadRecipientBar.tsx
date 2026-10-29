import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FormFieldRow, LightButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { AiChatNewThreadRecipientChip } from '@/ai/components/AiChatNewThreadRecipientChip';
import { AiChatNewThreadRecipientPicker } from '@/ai/components/AiChatNewThreadRecipientPicker';
import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const AiChatNewThreadRecipientBar = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const dropdownInstanceId = useId();
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const agentChatIsSendingMessage = useAtomFamilyStateValue(
    agentChatIsSendingMessageFamilyState,
    { threadId: newAiChatThreadId },
  );
  const [recipients, setRecipients] = useAtomFamilyState(
    agentChatNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const [agentChatNewThreadChannelId, setAgentChatNewThreadChannelId] =
    useAtomState(agentChatNewThreadChannelIdState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === agentChatNewThreadChannelId,
  );
  const recipientWorkspaceMembers = currentWorkspaceMembers.filter(({ id }) =>
    recipients.recipientWorkspaceMemberIds.includes(id),
  );

  const isCreatingChat = isOnNewAiChatSlot || !isDefined(currentAiChatThread);

  if (!isAiChatInboxEnabled || !isCreatingChat || isWorkspaceSetupChat) {
    return null;
  }

  return (
    <FormFieldRow
      aria-label={t`Recipients`}
      aria-busy={agentChatIsSendingMessage}
      contentPaddingInline={0}
    >
      {recipients.isAssistantParticipant && (
        <AiChatNewThreadRecipientChip
          label={AGENT_CHAT_ASSISTANT_NAME}
          avatar={<AiChatAssistantAvatar />}
          disabled={agentChatIsSendingMessage}
          onRemove={() =>
            setRecipients((current) => ({
              ...current,
              isAssistantParticipant: false,
            }))
          }
        />
      )}
      {recipientWorkspaceMembers.map((workspaceMember) => {
        const label = getWorkspaceMemberNameOrEmail(workspaceMember);

        return (
          <AiChatNewThreadRecipientChip
            key={workspaceMember.id}
            label={label}
            disabled={agentChatIsSendingMessage}
            avatar={
              <Avatar
                name={label}
                colorSeed={workspaceMember.id}
                src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
                size="sm"
                shape="circle"
              />
            }
            onRemove={() =>
              setRecipients((current) => ({
                ...current,
                recipientWorkspaceMemberIds:
                  current.recipientWorkspaceMemberIds.filter(
                    (recipientId) => recipientId !== workspaceMember.id,
                  ),
              }))
            }
          />
        );
      })}
      {isDefined(channel) && (
        <AiChatNewThreadRecipientChip
          label={channel.name}
          disabled={agentChatIsSendingMessage}
          avatar={
            <AgentChatChannelIcon channel={channel} size={theme.icon.size.sm} />
          }
          onRemove={() => setAgentChatNewThreadChannelId(null)}
        />
      )}
      <DropdownRoot
        dropdownId={`ai-chat-new-thread-recipients-${dropdownInstanceId}`}
        type="picker"
        multiple
      >
        <Dropdown.Trigger
          disabled={agentChatIsSendingMessage}
          render={
            <LightButton emphasis="subtle" size="sm">
              {t`Add people or a channel`}
            </LightButton>
          }
        />
        <DropdownContent width={280} aria-label={t`Select recipients`}>
          <AiChatNewThreadRecipientPicker />
        </DropdownContent>
      </DropdownRoot>
    </FormFieldRow>
  );
};
